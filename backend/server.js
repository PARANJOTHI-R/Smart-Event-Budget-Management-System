import express from 'express';
import cors from 'cors';
import 'dotenv/config.js';
import cookieParser from 'cookie-parser';
import connectDb from './config/mongoDb.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import eventRouter from './routes/eventRoutes.js';
import notificationRouter from './routes/notificationRoutes.js';

const app = express();
const PORT = process.env.PORT || 4000;

connectDb();

app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// Api Endpoints
app.get('/', (req, res) => { res.send('Eventify Backend Running'); });

app.use('/api/events', eventRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/notifications', notificationRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
