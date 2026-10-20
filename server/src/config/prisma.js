import pkg from 'pg';
const { Pool } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Resolve .env from the project root, independent of the shell's working directory.
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../');
dotenv.config({ path: resolve(projectRoot, '.env') });

// Thiết lập kết nối Pool của thư viện pg
const connectionString = process.env.DATABASE_URL;
export const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Khởi tạo PrismaClient với driver adapter theo chuẩn Prisma 7
const prisma = new PrismaClient({ adapter });

export default prisma;
