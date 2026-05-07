import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DataSource } from 'typeorm';

function loadEnvFile(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) {
    return {};
  }

  const env: Record<string, string> = {};
  const content = readFileSync(filePath, 'utf8');

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, '');

    env[key] = value;
  }

  return env;
}

const envFile =
  process.env.NODE_ENV === 'production'
    ? '.env.production.local'
    : '.env.development.local';

const env = {
  ...loadEnvFile(resolve(process.cwd(), envFile)),
  ...process.env,
};

const isProd = env.NODE_ENV === 'production';

export default new DataSource({
  type: 'postgres',
  url: env.DATABASE_URL,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: env.DB_LOGGING === 'true',
  ssl: isProd ? { rejectUnauthorized: true } : false,
  extra: isProd ? { ssl: { rejectUnauthorized: true } } : undefined,
});
