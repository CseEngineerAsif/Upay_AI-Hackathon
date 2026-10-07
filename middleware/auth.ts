import { Request, Response, NextFunction } from 'express';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

// Augment Express Request interface with authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        role?: string;
      };
    }
  }
}

// Initialize firebase-admin if not already initialized
if (getApps().length === 0) {
  try {
    let projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId) {
      const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        projectId = config.projectId;
      }
    }

    if (projectId) {
      initializeApp({
        projectId
      });
    } else {
      initializeApp();
    }
  } catch (err) {
    console.warn('Firebase Admin initialization notice:', err);
  }
}

/**
 * Authentication middleware that verifies Firebase ID token from Authorization header.
 * Attaches verified user (with uid) to req.user.
 * Rejects requests without valid token with 401 unless AUTH_DISABLED=true is explicitly set.
 */
export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const isAuthDisabled = process.env.AUTH_DISABLED === 'true';
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (isAuthDisabled) {
      // Local demo / mock mode fallback
      req.user = {
        uid: 'user_main_maynul',
        email: 'maynul@upay.com',
        role: 'user'
      };
      return next();
    }
    return res.status(401).json({
      error: 'Unauthorized: Missing or invalid Bearer token in Authorization header'
    });
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) {
    if (isAuthDisabled) {
      req.user = { uid: 'user_main_maynul', role: 'user' };
      return next();
    }
    return res.status(401).json({
      error: 'Unauthorized: Empty token provided'
    });
  }

  // Handle synthetic test tokens in testing environment
  if (process.env.NODE_ENV === 'test' || process.env.ALLOW_TEST_TOKENS === 'true') {
    if (token.startsWith('test_token_')) {
      const parts = token.replace('test_token_', '').split('_');
      const uid = parts[0] || 'test_user';
      const role = parts[1] || 'user';
      req.user = {
        uid,
        email: `${uid}@test.upay.com`,
        role
      };
      return next();
    }
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: (decodedToken.role as string) || 'user'
    };
    next();
  } catch (err: any) {
    if (isAuthDisabled) {
      // Fallback in case of expired test token in demo mode
      req.user = { uid: 'user_main_maynul', role: 'user' };
      return next();
    }
    return res.status(401).json({
      error: 'Unauthorized: Invalid or expired Firebase ID token',
      message: err.message
    });
  }
}

/**
 * Role-based authorization guard (e.g. requires role === 'analyst')
 */
export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }
    const userRole = req.user.role || 'user';
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Forbidden: Insufficient privileges for this operation',
        requiredRoles: allowedRoles
      });
    }
    next();
  };
}
