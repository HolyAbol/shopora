import dotenv from 'dotenv';
dotenv.config();
import z from 'zod';
import { AppDataSource } from '../configs/data-sources';
import { User } from '../logics/auth/user.entity';
import { passHasher } from '../logics/auth/auth.helpers';
import { adminSeedSchema } from './adminSeed.schema';

async function seedAdmin() {
  const creds = adminSeedSchema.safeParse(process.env);
  if (!creds.success) {
    console.error('invalid env:\n', z.prettifyError(creds.error));
    process.exit(1);
  }
  const { ADMIN_PASSWORD, ADMIN_EMAIL, ADMIN_PHONE_NUMBER, ADMIN_USERNAME } = creds.data;

  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(User);

  const adminExists = await repo.exists({ where: { role: 'admin' } });
  if (adminExists) {
    console.log('Admin already exists, skipping.');
    return;
  }

  const passwordHash = await passHasher(ADMIN_PASSWORD);

  await repo.save(
    repo.create({
      email: ADMIN_EMAIL,
      username: ADMIN_USERNAME,
      phoneNumber: ADMIN_PHONE_NUMBER,
      password: passwordHash,
      role: 'admin',
    })
  );

  console.log('Admin created:', ADMIN_EMAIL);
}

seedAdmin()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
  });
