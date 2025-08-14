type LogLevel = "debug" | "info" | "warn" | "error";

const env =
  (typeof process !== "undefined" && process.env?.NODE_ENV) || "development";
const isProd = env === "production";

function format(level: LogLevel, message: string, meta?: unknown) {
  const ts = new Date().toISOString();
  return { ts, level, message, meta };
}

export const logger = {
  debug(message: string, meta?: unknown) {
    if (!isProd) console.debug(format("debug", message, meta));
  },
  info(message: string, meta?: unknown) {
    if (!isProd) console.info(format("info", message, meta));
  },
  warn(message: string, meta?: unknown) {
    console.warn(format("warn", message, meta));
  },
  error(message: string, meta?: unknown) {
    console.error(format("error", message, meta));
  },
};
