import crypto from 'crypto';

export const csrfProtection = (req, res, next) => {
  // 1. Seed a CSRF token in a cookie if one doesn't exist yet
  let csrfToken = req.cookies['csrf-token'];
  if (!csrfToken) {
    csrfToken = crypto.randomBytes(32).toString('hex');
    // Note: Cookie must NOT be HttpOnly so client JavaScript can read it and send it in custom headers
    res.cookie('csrf-token', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/'
    });
  }

  // Attach token to request context so downstream controllers can access it reliably
  req.csrfToken = csrfToken;

  // 2. Safe HTTP methods (GET, HEAD, OPTIONS) bypass CSRF verification
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // 3. Double-Submit validation check for state-changing methods
  const headerToken = req.headers['x-csrf-token'];
  const cookieToken = req.cookies['csrf-token'];

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    // TODO(security): Fail closed on CSRF mismatch, prevent state change
    return res.status(403).json({ error: 'CSRF token validation failed. Unauthorized state change.' });
  }

  next();
};