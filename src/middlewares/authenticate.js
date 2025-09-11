import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { User } from '../models/user.js';

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticate = async (req, res, next) => {
  try {
    const header = req.get('Authorization') || '';
    const token = header.replace('Bearer ', '');
    if (!token) return next(createHttpError(401, 'No access token'));

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(createHttpError(401, 'Access token expired'));
      }
      return next(createHttpError(401, 'Invalid access token'));
    }

    const user = await User.findById(payload.userId);
    if (!user) return next(createHttpError(401, 'User not found'));

    req.user = { _id: user._id, name: user.name, email: user.email };
    next();
  } catch (err) {
    next(err);
  }
};
