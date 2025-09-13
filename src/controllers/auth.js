import { Session } from '../models/session.js';
import { loginUser, refreshSession, registerUser } from '../services/auth.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: process.env.COOKIE_SAME_SITE || 'Lax',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

export const registerController = async (req, res) => {
  const user = await registerUser(req.body);
  res.status(201).json({
    status: 201,
    message: 'Succesfully registered  user!',
    data: user,
  });
};

export const loginController = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await loginUser(req.body);

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    res.cookie('userId', user._id.toString(), COOKIE_OPTIONS);

    res.json({
      status: 200,
      message: 'Succesfully logged in an user!',
      data: { accessToken },
    });
  } catch (err) {
    next(err);
  }
};

export const refreshController = async (req, res) => {
  const { refreshToken } = req.cookies;
  const { accessToken, refreshToken: newRefresh } =
    await refreshSession(refreshToken);

  res.cookie('refreshToken', newRefresh, COOKIE_OPTIONS);
  res.json({
    status: 200,
    message: 'Succesfully refreshed a session!',
    data: { accessToken },
  });
};

export const logoutController = async (req, res, next) => {
  try {
    const { refreshToken, userId } = req.cookies;

    if (!refreshToken || !userId) {
      return res
        .status(400)
        .json({ status: 400, message: 'No refresh token provided' });
    }

    await Session.findOneAndDelete({ refreshToken, userId });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
    });
    res.clearCookie('userId', {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
