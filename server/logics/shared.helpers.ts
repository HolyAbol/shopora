import { DatabaseError } from 'pg';
import { QueryFailedError } from 'typeorm';
type projectStatus = 'online' | 'offline';
const projectstatus = process.env.CURRENT_STATUS as projectStatus;
function logger(err: unknown, status: projectStatus) {
  if (status === 'offline') {
    console.error(err);
    return;
  }
  console.error(err instanceof Error ? `${err.name}: ${err.message}` : err);
}
const isPgError = (err: unknown, code: string) =>
  err instanceof QueryFailedError &&
  err.driverError instanceof DatabaseError &&
  err.driverError.code === code
    ? err.driverError
    : null;

export { logger, projectstatus, isPgError };
