import * as winston from "winston"

export const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.json()
  ),
  levels: winston.config.syslog.levels,
  transports: [ new winston.transports.Console() ],
})
