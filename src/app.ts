import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { globalLimiter, authLimiter } from '@config/rateLimit.config.js';
import { corsOptions } from '@config/cors.config.js';
import { helmetOptions,  } from '@config/helmet.config.js';
// Middleware
import { errorHandler } from '@middlewares/errorHandler.js';
import { generateDeviceIdMiddleware } from '@middlewares/deviceId-generator.middleware.js';
import apiWatcher from '@middlewares/api-watcher.middleware.js';
import notFoundHandler from '@middlewares/notFoundHandler.js';
// Routes
import healthRoute from '@module/health/health.route.js';
import userRoute from '@module/user/user.route.js';
import variantRoute from '@module/variant/variant.route.js';
import authRoute from '@module/authentication/auth.route.js';
import productRoute from '@module/product/product.route.js';
import categoryRoute from '@module/category/category.route.js';
// Swagger
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import { swaggerOptions } from './swagger.config.js';

const app = express();
app.set('trust proxy', 1);
const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use(helmet(helmetOptions));
app.use(cors(corsOptions));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use(generateDeviceIdMiddleware());
app.use(apiWatcher);
app.use(globalLimiter);

app.get('/', (_req, res) => res.send('Welcome to the Express TypeScript App!'));

app.use('/api/v1/auth', authLimiter, authRoute);
app.use('/api/v1/user', userRoute);
app.use('/api/v1/variant', variantRoute);
app.use('/api/v1/product', productRoute);
app.use('/api/v1/category', categoryRoute);
app.use('/api/v1', healthRoute);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(notFoundHandler);
app.use(errorHandler);

export default app;