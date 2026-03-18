import { z } from 'zod';

const EnvSchema = z.object({
  // OpenAI
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),

  // Supabase — public (safe for browser)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),

  // Supabase — private (server only)
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  // Notion
  NOTION_API_KEY: z.string().min(1, 'NOTION_API_KEY is required'),
  NOTION_DEFAULT_DATABASE_ID: z.string().min(1, 'NOTION_DEFAULT_DATABASE_ID is required'),

  // App
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
