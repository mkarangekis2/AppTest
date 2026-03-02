const requiredServer = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY"
] as const;

export function getEnv(name: keyof NodeJS.ProcessEnv): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export function assertServerEnv(): void {
  for (const key of requiredServer) {
    getEnv(key);
  }
}

export function hasOpenAi(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}
