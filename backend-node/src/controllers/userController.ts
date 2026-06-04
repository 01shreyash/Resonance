import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import pool from '../config/db'; // Adjust this import to match your Postgres setup

export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // req.user.id was placed here by our middleware!
    const userId = req.user?.id; 

    // Query PostgreSQL for the user (exclude the password hash!)
    const result = await pool.query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Send the clean user profile back to React
    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};