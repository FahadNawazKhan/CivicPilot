import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';

// Retrieve JWT secret securely, fallback to an ephemeral random secret if undefined
const getJwtSecret = () => {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }
  if (!global._ephemeralJwtSecret) {
    global._ephemeralJwtSecret = crypto.randomBytes(32).toString('hex');
  }
  return global._ephemeralJwtSecret;
};

/**
 * Register a new user.
 * Validates password strength and username format constraint.
 */
export const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    // Validate username format
    if (!/^[a-zA-Z0-9\-_]{3,30}$/.test(username)) {
      return res.status(400).json({ error: 'Username must be alphanumeric, between 3 and 30 characters.' });
    }

    // Validate password strength: minimum 8 characters
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: 'Username is already taken.' });
    }

    const user = new User({ username, password });
    await user.save();

    res.status(201).json({ success: true, message: 'User registered successfully.' });
  } catch (error) {
    // TODO(security): Log detailed diagnostics safely, display generic sanitized message to user
    console.error('Registration error:', error);
    res.status(500).json({ error: 'An error occurred during user registration.' });
  }
};

/**
 * Authenticate a user and set a session cookie.
 * Clears and regenerates CSRF token to prevent token fixation.
 */
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // Sign JWT
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      getJwtSecret(),
      { expiresIn: '24h', algorithm: 'HS256' }
    );

    const isProd = process.env.NODE_ENV === 'production';
    
    // Set JWT cookie securely
    const cookieName = isProd ? '__Host-token' : 'token';
    res.cookie(cookieName, token, {
      httpOnly: true,
      secure: isProd || req.secure || req.headers['x-forwarded-proto'] === 'https',
      sameSite: 'Lax',
      path: '/'
    });

    // Refresh/regenerate CSRF token on login
    const csrfToken = crypto.randomBytes(32).toString('hex');
    res.cookie('csrf-token', csrfToken, {
      httpOnly: false,
      secure: isProd || req.secure || req.headers['x-forwarded-proto'] === 'https',
      sameSite: 'Lax',
      path: '/'
    });

    res.json({
      success: true,
      user: {
        userId: user._id,
        username: user.username
      },
      csrfToken
    });
  } catch (error) {
    // TODO(security): Log detailed diagnostics safely, display generic sanitized message to user
    console.error('Login error:', error);
    res.status(500).json({ error: 'An error occurred during authentication.' });
  }
};

/**
 * Log out the current user by clearing session cookies.
 */
export const logoutUser = async (req, res) => {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    
    // Clear both possible cookie configurations
    res.clearCookie('__Host-token', { path: '/' });
    res.clearCookie('token', { path: '/' });
    res.clearCookie('csrf-token', { path: '/' });

    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'An error occurred during logout.' });
  }
};

/**
 * Returns currently authenticated user details.
 */
export const getMe = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'An error occurred while loading profile.' });
  }
};

/**
 * Returns the active CSRF token stored in the cookie.
 */
export const getCsrfToken = async (req, res) => {
  try {
    res.json({ csrfToken: req.csrfToken || req.cookies['csrf-token'] });
  } catch (error) {
    console.error('Get CSRF token error:', error);
    res.status(500).json({ error: 'An error occurred while loading CSRF token.' });
  }
};