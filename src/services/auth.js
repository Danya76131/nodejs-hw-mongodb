import bcrypt from 'bcrypt';
import pkg from 'jsonwebtoken';
const { sign, verify } = pkg;
import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_EXPIRES = process.env.ACCESS_EXPIRES || '15m';
const REFRESH_EXPIRES = process.env.REFRESH_EXPIRES || '30d';

const signToken = (payload, expiresIn) =>
  sign(payload, JWT_SECRET, { expiresIn });

export const registerUser = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw createHttpError(409, 'Email in use');

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash });

  const obj = user.toObject();
  delete obj.password;
  return obj;
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw createHttpError(401, 'Email or password is wrong');

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw createHttpError(401, 'Email or password is wrong');

  // Видаляємо старі сесії
  await Session.deleteMany({ userId: user._id });

  const accessToken = signToken({ userId: user._id }, ACCESS_EXPIRES);
  const refreshToken = signToken({ userId: user._id }, REFRESH_EXPIRES);

  const accessTokenValidUntil = new Date(
    Date.now() + msFromJwtExp(ACCESS_EXPIRES),
  );
  const refreshTokenValidUntil = new Date(
    Date.now() + msFromJwtExp(REFRESH_EXPIRES),
  );

  const session = await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return {
    accessToken,
    refreshToken,
    sessionId: session._id,
    user: { _id: user._id, name: user.name, email: user.email },
  };
};

export const refreshSession = async ({ sessionId, refreshToken }) => {
  if (!refreshToken || !sessionId)
    throw createHttpError(401, 'No tokens provided');

  const prevSession = await Session.findOne({ _id: sessionId, refreshToken });
  if (!prevSession) throw createHttpError(401, 'Session not found');

  let payload;
  try {
    payload = verify(refreshToken, JWT_SECRET);
  } catch (err) {
    throw createHttpError(401, 'Invalid refresh token');
  }

  await Session.deleteOne({ _id: sessionId });

  const accessToken = signToken({ userId: payload.userId }, ACCESS_EXPIRES);
  const newRefreshToken = signToken(
    { userId: payload.userId },
    REFRESH_EXPIRES,
  );

  const accessTokenValidUntil = new Date(
    Date.now() + msFromJwtExp(ACCESS_EXPIRES),
  );
  const refreshTokenValidUntil = new Date(
    Date.now() + msFromJwtExp(REFRESH_EXPIRES),
  );

  const session = await Session.create({
    userId: payload.userId,
    accessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return { accessToken, refreshToken: newRefreshToken, sessionId: session._id };
};

export const logoutSession = async ({ sessionId, refreshToken }) => {
  if (!sessionId || !refreshToken) return;
  await Session.deleteOne({ _id: sessionId, refreshToken });
};

// Допоміжна функція: конвертуємо '15m'/'30d' у мілісекунди
function msFromJwtExp(exp) {
  const num = parseInt(exp, 10);
  if (exp.endsWith('m')) return num * 60 * 1000;
  if (exp.endsWith('h')) return num * 60 * 60 * 1000;
  if (exp.endsWith('d')) return num * 24 * 60 * 60 * 1000;
  return 0;
}
