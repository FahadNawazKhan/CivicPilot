import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Retrieve JWT secret securely, fallback to an ephemeral random secret if undefined
const getJwtSecret = () => {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }
  console.warn("WARNING(security): JWT_SECRET is not configured. Generating ephemeral secret key.");
  if (!global._ephemeralJwtSecret) {
    global._ephemeralJwtSecret = crypto.randomBytes(32).toString('hex');
  }
  return global._ephemeralJwtSecret;
};

export const authenticateUser = (req, res, next) => {
  // Check for the Host-prefixed token first, then fallback to standard token cookie name for local HTTP testing
  const token = req.cookies['__Host-token'] || req.cookies['token'];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No session token provided.' });
  }

  try {
    // TODO(security): Hardcode the expected algorithm for verification to prevent algorithm confusion attacks
    const verified = jwt.verify(token, getJwtSecret(), {
      algorithms: ['HS256']
    });
    req.user = verified;
    next();
  } catch (error) {
    // Fail closed safely, do not leak verification errors
    res.status(401).json({ error: 'Invalid or expired session token.' });
  }
};

export const optionalAuthenticate = (req, res, next) => {
  const token = req.cookies['__Host-token'] || req.cookies['token'];
  if (!token) {
    return next();
  }
  try {
    const verified = jwt.verify(token, getJwtSecret(), {
      algorithms: ['HS256']
    });
    req.user = verified;
  } catch (error) {
    // Silently continue for guests on verification failure
  }
  next();
};