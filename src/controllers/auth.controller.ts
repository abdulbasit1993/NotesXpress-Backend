import database from '../config/db';
import { Request, Response } from 'express';
import { User, UserRole } from '../types/user';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = database.getDb();
    const { username, password, email, role } = req.body;

    // Input validation
    if (!username) {
      res.status(400).json({
        success: false,
        message: 'Username is required',
      });

      return;
    }

    if (!password) {
      res.status(400).json({
        success: false,
        message: 'Password is required',
      });

      return;
    }

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required',
      });

      return;
    }

    const emailRegex =
      /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:\\[\x00-\x7F]|[^\\"])*")@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });

      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });

      return;
    }

    if (username.length < 3) {
      res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters long',
      });

      return;
    }

    const userRole: UserRole =
      role && ['USER', 'ADMIN'].includes(role) ? role : 'USER';

    const usersCollection = db.collection<User>('users');

    const existingUser = await usersCollection.findOne({
      $or: [
        { email: email.toLowerCase() },
        {
          username: {
            $regex: new RegExp(`^${username}$`, 'i'),
          },
        },
      ],
    });

    if (existingUser) {
      const field =
        existingUser.email === email.toLowerCase() ? 'email' : 'username';
      res.status(409).json({
        success: false,
        message: `User with this ${field} already exists`,
      });

      return;
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser: User = {
      username: username,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: userRole,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    if (!result.insertedId) {
      res.status(500).json({
        message: 'Failed to create user account',
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not found in environment variables');
      res.status(500).json({
        message: 'Server configuration error',
      });
      return;
    }

    const tokenPayload = {
      userId: result.insertedId.toString(),
    };

    const accessToken = jwt.sign(tokenPayload, jwtSecret, {
      expiresIn: '365d',
    });

    res.status(201).json({
      success: true,
      message: 'User account created successfully',
      user: {
        id: result.insertedId.toString(),
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
      token: accessToken,
    });
  } catch (error) {
    console.error('Signup error: ', error);

    if (error && typeof error === 'object' && 'code' in error) {
      if ((error as any).code === 11000) {
        res.status(409).json({
          success: false,
          message: 'User with this email or username already exists',
        });
        return;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occured';

      res.status(500).json({
        message: 'Internal server error',
        error: errorMessage,
      });
    }
  }
};

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = database.getDb();
    const { email, password } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required',
      });

      return;
    }

    if (!password) {
      res.status(400).json({
        success: false,
        message: 'Password is required',
      });

      return;
    }

    const emailRegex =
      /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:\\[\x00-\x7F]|[^\\"])*")@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });

      return;
    }

    const usersCollection = db.collection<User>('users');

    const user = await usersCollection.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Invalid email or password',
      });

      return;
    }

    if (user.status !== 'ACTIVE') {
      res.status(403).json({
        success: false,
        message:
          'Account is inactive. Please contact admin to activate your account',
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(400).json({
        success: false,
        message: 'Invalid email or password',
      });

      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not found in environment variables');
      res.status(500).json({
        message: 'Server configuration error',
      });
      return;
    }

    const tokenPayload = {
      userId: user._id!.toString(),
    };

    const accessToken = jwt.sign(tokenPayload, jwtSecret, {
      expiresIn: '365d',
    });

    res.status(200).json({
      success: true,
      message: 'User Login Successful',
      user: {
        id: user._id!.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token: accessToken,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occured';

    res.status(500).json({
      message: 'Internal server error',
      error: errorMessage,
    });
  }
};

module.exports = {
  signup,
  login,
};
