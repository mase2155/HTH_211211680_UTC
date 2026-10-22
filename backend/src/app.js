const crypto = require('crypto');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const pinoHttp = require('pino-http');
const config = require('./config/env');
const logger = require('./config/logger');
const routes = require('./routes');
const { apiLimiter } = require('./middlewares/rateLimiter');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const API_PREFIX = '/api/v1';
const JSON_BODY_LIMIT = '100kb';
const STATIC_CACHE_MS = 7 * 24 * 60 * 60 * 1000;

const app = express();

app.disable('x-powered-by');
if (config.trustProxy) app.set('trust proxy', 1);

app.use(
  pinoHttp({
    logger,
    genReqId: (req, res) => {
      const id = req.headers['x-request-id'] || crypto.randomUUID();
      res.setHeader('X-Request-Id', id);
      return id;
    },
    autoLogging: { ignore: (req) => req.url === `${API_PREFIX}/health` },
  }),
);
// Cho phép trang web khác origin hiển thị ảnh trong /uploads
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: (origin, callback) =>
      !origin || config.corsOrigins.includes(origin)
        ? callback(null, true)
        : callback(null, false),
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json({ limit: JSON_BODY_LIMIT }));
app.use(cookieParser());

app.use('/uploads', express.static(config.upload.rootDir, { maxAge: STATIC_CACHE_MS, index: false }));
app.use(API_PREFIX, apiLimiter, routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
