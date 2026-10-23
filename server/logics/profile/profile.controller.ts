import { Response, Request } from 'express';
import { passHasher, compare, clearCookie } from '../auth/auth.helpers.ts';
import { userInfoSchema, changeUsernameSchema, changePasswordSchema } from './profile.schemas.ts';
import { User } from '../auth/user.entity.ts';
import { AppDataSource } from '../../configs/data-sources.ts';
import z from 'zod';
import { Shop } from '../shop/shop.entity.ts';
import { Product } from '../products/product.entity.ts';
import { softDeleteProducts } from '../products/products.helper.ts';
import { IsNull } from 'typeorm';
async function getProfile(req: Request, res: Response) {
  if (!req.user) {
    return res.status(404).json({ message: 'user not found' });
  }
  return res.status(200).json(req.user);
}

async function changeFullname(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }

  const userInfo = userInfoSchema.safeParse(req.body);
  if (!userInfo.success) {
    return res.status(400).json('missing credentials');
  }

  const { firstName, lastName } = userInfo.data;
  const userId = req.user.userId;
  try {
    const repo = AppDataSource.getRepository(User);
    const result = await repo.update(
      { userId: userId },
      { firstName: firstName, lastName: lastName }
    );

    if (result.affected === 0) {
      return res.status(404).json({ message: 'user not found' });
    }

    return res.status(200).json({ message: 'success' });
  } catch {
    return res.status(500).json({ message: 'unexpected error' });
  }
}

async function changeUsername(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }

  const Details = changeUsernameSchema.safeParse(req.body);
  if (!Details.success) {
    return res.status(400).json({ message: 'missing credentials' });
  }
  const { newUsername } = Details.data;
  const userId = req.user.userId;
  try {
    const repo = AppDataSource.getRepository(User);
    const result = await repo.update({ userId: userId }, { username: newUsername });

    if (result.affected === 0) {
      return res.status(404).json({ message: 'user not found' });
    }

    return res.status(200).json({ message: 'success' });
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && err.code == '23505') {
      return res.status(409).json({ message: 'username already exists' });
    }
    return res.status(500).json({ message: 'unexpected error' });
  }
}

async function changePassword(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'unauthorized' });
  }
  const Details = changePasswordSchema.safeParse(req.body);
  if (!Details.success) {
    return res
      .status(400)
      .json({ message: 'missing credentials', errors: z.treeifyError(Details.error) });
  }

  const { newPassword, oldPassword } = Details.data;
  const userId = req.user.userId;
  try {
    const repo = AppDataSource.getRepository(User);
    const result = await repo.findOne({ where: { userId: userId }, select: { password: true } });

    if (!result) {
      return res.status(404).json({ message: 'user not found' });
    }

    if (oldPassword && newPassword) {
      const checkStatus = await compare(oldPassword, result.password);

      if (checkStatus) {
        if (oldPassword === newPassword) {
          return res.status(400).json({ message: 'new password cant be your current password' });
        } else {
          const hashedPassword = await passHasher(newPassword);
          const change = await repo.update({ userId: userId }, { password: hashedPassword });
          if (change.affected === 0) {
            throw new Error('user not found ');
          }
          clearCookie(res);
          return res.status(200).json({ message: 'password has been changed successfully' });
        }
      } else {
        return res.status(400).json({ message: 'passwords dont match' });
      }
    } else {
      return res.status(400).json({ message: 'fileds must not be empty' });
    }
  } catch (err: any) {
    const pgErr = err.driverError ?? err;
    if (pgErr === '23505') {
      return res.status(409).json({ message: 'new password cant be your current password' });
    }
    return res.status(500).json({ message: 'unexpected error' });
  }
}

async function deleteProfile(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'not authorized' });
  }
  const user = req.user;
  try {
    if (user.role === 'user') {
      const repo = AppDataSource.getRepository(User);
      const result = await repo.softDelete({ userId: user.userId });

      if (result.affected === 0) {
        return res.status(404).json({ message: 'user not found' });
      }

      clearCookie(res);
      return res.status(200).json({ message: 'goodbye' });
    }
    const outcome = await AppDataSource.transaction(async (manager) => {
      const shop = await manager.findOne(Shop, {
        where: { ownerId: user.userId },
        select: { shopId: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!shop) return 'not_found' as const;
      await manager.softDelete(Shop, { shopId: shop.shopId, deletedAt: IsNull() });
      await manager.softDelete(Product, { shopId: shop.shopId, deletedAt: IsNull() });
      await softDeleteProducts(manager, { shopId: shop.shopId });
      return 'ok' as const;
    });

    if (outcome === 'not_found') {
      return res.status(404).json({ message: 'shop not found' });
    }
    clearCookie(res);
    return res.status(200).json({ message: 'goodbye' });
  } catch {
    return res.status(500).json({ message: 'unexpected error' });
  }
}

export { getProfile, changeFullname, changeUsername, changePassword, deleteProfile };
