import * as winston from "winston"

const LOG_LEVELS = winston.config.syslog.levels
const DEFAULT_LOG_LEVEL = "debug"

const getLogLevel = (): string => {
    const logLevelEnvVar = process.env.LOG_LEVEL
    if (logLevelEnvVar) {
        const isAllowedLogLevel = Object.keys(LOG_LEVELS)
            .find(level => logLevelEnvVar.toLowerCase() === level.toLowerCase())
        if (!isAllowedLogLevel) {
            console.log("Unsupported log level: ", logLevelEnvVar)
        } else {
            return isAllowedLogLevel
        }
    }
    return DEFAULT_LOG_LEVEL


}

export const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.json()
    ),
    level: getLogLevel(),
    levels: LOG_LEVELS,
    transports: [new winston.transports.Console()],
})


