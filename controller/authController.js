
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userModel = require('../model/userModel');
const refreshTokenModel = require('../model/refreshTokenModel');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { hashToken } = require('../utils/hashToken');
const logger = require('../config/logger');

const SALT_ROUNDS = 12;
const REFRESH_COOKIE_NAME = 'stockflow_refresh_token';

const refreshCookieOptions = {
  httpOnly: true, 
  sameSite: 'strict',
  path: '/api/auth', 
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function decodeExpiry(token) {
  const decoded = jwt.decode(token);
  return new Date(decoded.exp * 1000);
}


async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userModel.createUser({ name, email, passwordHash, role: 'staff' });

    logger.info('User registered', { userId: user.id, email: user.email });
    return res.status(201).json({ user });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findByEmail(email);
    if (!user || !user.is_active) {
      
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      logger.warn('Failed login attempt', { email });
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await refreshTokenModel.storeToken({
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: decodeExpiry(refreshToken),
    });

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
    logger.info('User logged in', { userId: user.id });

    return res.json({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        warehouseId: user.warehouse_id,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const token = req.cookies[REFRESH_COOKIE_NAME];
    if (!token) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const tokenHash = hashToken(token);
    const stored = await refreshTokenModel.findValidToken(tokenHash);
    if (!stored) {
      return res.status(401).json({ message: 'Refresh token has been revoked or reused' });
    }

    const user = await userModel.findById(payload.sub);
    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'User no longer active' });
    }

    await refreshTokenModel.revokeToken(tokenHash);
    const newRefreshToken = generateRefreshToken(user);
    await refreshTokenModel.storeToken({
      userId: user.id,
      tokenHash: hashToken(newRefreshToken),
      expiresAt: decodeExpiry(newRefreshToken),
    });
    res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, refreshCookieOptions);

    const accessToken = generateAccessToken(user);
    return res.json({ accessToken });
  } catch (err) {
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
    const token = req.cookies[REFRESH_COOKIE_NAME];
    if (token) {
      await refreshTokenModel.revokeToken(hashToken(token));
    }
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login, refresh, logout, REFRESH_COOKIE_NAME };
