import winston from "winston";
import { env } from "./env.js";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const transports = [];

if (env.NODE_ENV === "production") {
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({ filename: "logs/combined.log" })
  );
} else {
  transports.push(
    new winston.transports.Console({
      level: "debug",
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.printf(
          (info) =>
            `[${info.timestamp}] [${info.level}]: ${info.message}${info.stack ? `\n${info.stack}` : ""}`
        )
      ),
    })
  );
}

export const logger = winston.createLogger({
  level: env.NODE_ENV === "development" ? "debug" : "info",
  levels,
  format,
  transports,
  exitOnError: false,
});
export default logger;
