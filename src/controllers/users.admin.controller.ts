import database from '../config/db';
import { Request, Response } from 'express';
import { User, UserRole } from '../types/user';
import { ObjectId, Filter } from 'mongodb';

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const db = database.getDb();

    const usersCollection = db.collection<User>('users');

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    if (page < 1) {
      res.status(400).json({
        success: false,
        message: 'Page number must be greater than 0',
      });

      return;
    }

    if (limit < 1 || limit > 100) {
      res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 100',
      });

      return;
    }

    const filter: Filter<User> = {};

    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      filter.$or = [{ email: searchRegex }, { username: searchRegex }];
    }

    const skip = (page - 1) * limit;

    const totalUsers = await usersCollection.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await usersCollection
      .find(filter)
      .skip(skip)
      .limit(limit)
      .toArray();

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        totalPages,
        totalUsers,
      },
    });
  } catch (error) {
    console.log('Error in getAllUsers controller: ', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

const getSingleUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });

      return;
    }

    const db = database.getDb();

    const usersCollection = db.collection<User>('users');

    const user = await usersCollection.findOne({ _id: new ObjectId(id) });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.log('Error in getSingleUser controller: ', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email, status, role } = req.body;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });

      return;
    }

    const db = database.getDb();

    const usersCollection = db.collection<User>('users');

    const user = await usersCollection.findOne({ _id: new ObjectId(id) });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });

      return;
    }

    const updatedUser = {
      username: username || user.username,
      email: email || user.email,
      status: status || user.status,
      role: role || user.role,
      updatedAt: new Date(),
    };

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedUser },
    );

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: result,
    });
  } catch (error) {
    console.log('Error in updateUser controller: ', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });

      return;
    }

    const db = database.getDb();

    const usersCollection = db.collection<User>('users');

    const user = await usersCollection.findOne({ _id: new ObjectId(id) });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });

      return;
    }

    await usersCollection.deleteOne({ _id: new ObjectId(id) });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.log('Error in deleteUser controller: ', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

module.exports = {
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
};
