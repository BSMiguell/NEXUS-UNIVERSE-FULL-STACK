const viteEnv =
  typeof import.meta !== "undefined" && typeof import.meta.env !== "undefined"
    ? import.meta.env
    : undefined;

export function getRuntimeEnv(name: string) {
  const viteValue = viteEnv?.[name];

  if (typeof viteValue === "string" && viteValue.length > 0) {
    return viteValue;
  }

  if (typeof process !== "undefined" && process.env?.[name]) {
    return process.env[name];
  }

  return undefined;
}

export function getRuntimeMode() {
  return (
    getRuntimeEnv("MODE") ??
    getRuntimeEnv("NODE_ENV") ??
    "development"
  );
}
