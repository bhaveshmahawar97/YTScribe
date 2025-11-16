const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');

const isProduction = process.env.NODE_ENV === 'production';

// Helper: remove sensitive fields like password before sending user data to the client
function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    provider: user.provider,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// Helper: set HTTP-only cookies for access and refresh tokens
function setAuthCookies(res, accessToken, refreshToken) {
  const baseOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  };

  // Short-lived access token
  res.cookie('access_token', accessToken, {
    ...baseOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Longer-lived refresh token
  res.cookie('refresh_token', refreshToken, {
    ...baseOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

// POST /api/auth/register
// Create a new local (email/password) user
async function register(req, res, next) {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ success: false, message: 'Password must be at least 8 characters long' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'user',
      provider: 'local',
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    setAuthCookies(res, accessToken, refreshToken);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/login
// Log in a user with email and password
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || user.provider !== 'local') {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    setAuthCookies(res, accessToken, refreshToken);

    return res.json({
      success: true,
      message: 'Logged in successfully',
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/refresh
// Use the refresh token to issue a new access token (and optionally a new refresh token)
async function refreshToken(req, res, next) {
  try {
    const token = req.cookies && req.cookies.refresh_token;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token missing' });
    }

    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      return res
        .status(500)
        .json({ success: false, message: 'Refresh token secret not configured' });
    }

    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    setAuthCookies(res, newAccessToken, newRefreshToken);

    return res.json({
      success: true,
      message: 'Token refreshed',
      user: sanitizeUser(user),
    });
  } catch (error) {
    // If token is invalid or expired, return 401
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
}

// POST /api/auth/logout
// Clear auth cookies so the user is logged out
function logout(req, res) {
  const baseOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  };

  res.clearCookie('access_token', baseOptions);
  res.clearCookie('refresh_token', baseOptions);

  return res.json({ success: true, message: 'Logged out successfully' });
}

// OAuth callback success handler
// Passport attaches the authenticated user to req.user
function oauthCallback(req, res) {
  const passportUser = req.user;

  if (!passportUser) {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    return res.redirect(clientUrl + '/auth/error');
  }

  const accessToken = generateAccessToken(passportUser);
  const refreshToken = generateRefreshToken(passportUser);

  setAuthCookies(res, accessToken, refreshToken);

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  // Frontend can call /api/user/me after this redirect to get user info
  return res.redirect(clientUrl + '/auth/success');
}

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  oauthCallback,
};
