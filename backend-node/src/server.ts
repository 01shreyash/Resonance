import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.get('/health', async (req, res) => {
  try {
    const dbCheck = await pool.query('SELECT NOW()');
    res.json({ status: 'OK', database: 'Connected', time: dbCheck.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'Error', message: 'Database connection failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Resonance backend running on port ${PORT}`);
});