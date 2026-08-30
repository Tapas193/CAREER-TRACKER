import path from 'path';

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5179',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  storageDriver: process.env.STORAGE_DRIVER || 'local',
  storageLocalDir: process.env.STORAGE_LOCAL_DIR || 'uploads',
  storageBaseUrl: process.env.STORAGE_BASE_URL || `http://localhost:${process.env.PORT || 4000}`,
};

export const uploadsDir = path.resolve(__dirname, '..', '..', config.storageLocalDir);

export const isProd = config.nodeEnv === 'production';
