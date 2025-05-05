import { db } from '@db';
import { createApiKeysRepo } from '@repositories/apiKey.repository';

export const apiKeysRepo = createApiKeysRepo(db);
