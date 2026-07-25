import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const maskFormat = winston.format((info) => {
  const sensitiveKeys = ['password', 'pin', 'otp', 'cvv', 'token', 'secret'];
  
  const maskValue = (val: any): any => {
    if (typeof val === 'string') {
      if (/^\d{13,19}$/.test(val)) {
        return val.slice(0, 6) + '*'.repeat(val.length - 10) + val.slice(-4);
      }
      return '***';
    }
    return val;
  };

  const recursiveMask = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        obj[key] = maskValue(obj[key]);
      } else if (typeof obj[key] === 'object') {
        recursiveMask(obj[key]);
      }
    }
  };

  recursiveMask(info);
  return info;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    maskFormat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'unknown-service' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      zippedArchive: true,
    }),
    new DailyRotateFile({
      level: 'error',
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      zippedArchive: true,
    })
  ]
});

export function setServiceMeta(serviceName: string) {
  Object.assign(logger.defaultMeta, { service: serviceName });
}
