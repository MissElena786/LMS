import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
// import { config } from 'dotenv';
import dotenv from 'dotenv';
import morgan from 'morgan';
import userRoutes from './routes/user.routes.js'
import courseRoutes from './routes/course.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import errorMiddleware from './middlewares/error.middleware.js';
// config();
dotenv.config()

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    // origin: [process.env.FRONTEND_URL],
    origin: "*",
    credentials: true
}));

app.use(cookieParser());

app.use(morgan('dev'));

app.use('/ping', function(req, res){
    res.send('Pong');
});
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/payments', paymentRoutes);

app.all('*', (req, res) => {
    res.status(404).send('OOPS 404 page not found');
});

app.use(errorMiddleware);

export default app;