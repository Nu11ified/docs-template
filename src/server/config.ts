import { parse } from "yaml";
import { readFileSync } from "fs";
import { FullConfigSchema, type FullConfig } from "../shared/types";

let cachedConfig: FullConfig | null = null;

export function loadConfig(configPath = "site.yaml"): FullConfig {
  if (cachedConfig) return cachedConfig;

  const raw = readFileSync(configPath, "utf-8");
  const parsed = parse(raw);
  const validated = FullConfigSchema.parse(parsed);

  cachedConfig = validated;
  return validated;
}

export function clearConfigCache() {
  cachedConfig = null;
}