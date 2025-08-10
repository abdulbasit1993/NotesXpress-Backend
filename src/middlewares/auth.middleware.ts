import { Request, Response, NextFunction } from 'express';
import database from '../config/db';
import { User } from '../types/user';
import { ObjectId } from 'mongodb';
const jwt = require('jsonwebtoken');

const verifyToken = (
  req: Request & {
    user?: {
      userId?: string;
    };
  },
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'Unauthorized, No token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    const err = error as Error & { name: string };
    const message =
      err.name === 'TokenExpiredError' ? 'Token Expired' : 'Invalid Token';
    return res.status(401).json({ message });
  }
};

const isAdmin = async (
  req: Request & {
    user?: {
      userId?: string;
    };
  },
  res: Response,
  next: NextFunction,
) => {
  const db = database.getDb();
  try {
    const usersCollection = db.collection<User>('users');
    const user = await usersCollection.findOne({
      _id: new ObjectId(req?.user?.userId),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required',
      });
    }

    next();
  } catch (error) {
    console.log('Error in isAdmin middleware: ', error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
};
