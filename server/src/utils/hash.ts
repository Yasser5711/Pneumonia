import bcrypt from 'bcrypt';
const SALT_ROUNDS = 12;

export const hashApiKey = async (key: string): Promise<string> => {
  return bcrypt.hash(key, SALT_ROUNDS);
};

export const compareApiKey = async (key: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(key, hash);
};
