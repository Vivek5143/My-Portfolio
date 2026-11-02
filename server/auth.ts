import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from './config';

export interface AdminUserPayload {
  username: string;
  role: 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: AdminUserPayload;
    }
  }
}

/**
 * Generate a signed JWT token for the authenticated admin
 */
export function generateAdminToken(username: string): string {
  const payload: AdminUserPayload = {
    username,
    role: 'admin',
  };
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: '24h',
    algorithm: 'HS256',
  });
}

/**
 * Validate admin credentials
 */
export async function verifyAdminCredentials(password: string): Promise<boolean> {
  // Check against hashed password
  return bcrypt.compare(password, config.adminPasswordHash);
}

/**
 * Middleware that strictly enforces admin authentication and authorization on the server
 */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication token required in Authorization header (Bearer <token>).',
    });
    return;
  }

  const token = authHeader.slice(7).trim();

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AdminUserPayload;
    if (decoded.role !== 'admin') {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient administrative privileges.',
      });
      return;
    }
    req.user = decoded;
    next();
  } catch (err: any) {
    res.status(401).json({
      error: 'Unauthorized',
      message: err.name === 'TokenExpiredError' ? 'Authentication token expired.' : 'Invalid authentication token.',
    });
  }
}
