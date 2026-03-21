import { z } from 'zod';

const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  OLLAMA_BASE_URL: z.string().url('OLLAMA_BASE_URL must be a valid URL'),
  OLLAMA_EMBEDDING_MODEL: z.string().min(1, 'OLLAMA_EMBEDDING_MODEL is required'),

  GROQ_API_KEY: z.string().min(1, 'GROQ_API_KEY is required'),
  GROQ_MODEL: z.string().min(1, 'GROQ_MODEL is required'),

  NOTION_API_KEY: z.string().min(1, 'NOTION_API_KEY is required'),
  NOTION_DEFAULT_DATABASE_ID: z.string().min(1, 'NOTION_DEFAULT_DATABASE_ID is required'),

  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

type Env = z.infer<typeof EnvSchema>;

function validateEnv(): Env {
  const result = EnvSchema.safeParse(process.env);

  if (!result.success) {
    const missing = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(
      `\n\nEnvironment validation failed. Missing or invalid variables:\n${missing}\n\nSee .env.example for the full list of required variables.\n`,
    );
  }

  return result.data;
}

export const config: Env = validateEnv();
