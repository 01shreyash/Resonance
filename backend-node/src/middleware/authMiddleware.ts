import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request to include our decrypted user data
export interface AuthRequest extends Request {
  user?: { id: string };
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  let token;

  // Check if the token is in the headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token string
      token = req.headers.authorization.split(' ')[1];

      // Decrypt the token (using 'any' here temporarily to bypass strict typing for the fix)
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

      // FIX: Grab 'userId' from the token instead of 'id'
      req.user = { id: decoded.userId };
      
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};