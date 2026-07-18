import express from 'express';
import cors from 'cors';
import 'dotenv/config.js';
import cookieParser from 'cookie-parser';
import connectDb from './config/mongoDb.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
const app = express();
const PORT = process.env.PORT || 4000;

import eventRouter from './routes/eventRoutes.js';

connectDb();

const allowedOrigins = [
    'http://localhost:5173',
    'eventifybudgetmanager.vercel.app'  
];

app.use(express.json());
app.use(cookieParser());
app.use(cors({ 
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
 }));

//Api Endpoints
app.get('/',(req,res)=>{
    res.send('Hello from backend server side');
});

app.use('/api/events',eventRouter);
app.use('/api/auth',authRouter);
app.use('/api/user',userRouter);



app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})
