import database from '../config/db';
import { Request, Response } from 'express';
import { User, UserRole } from '../types/user';

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const db = database.getDb();

    const usersCollection = db.collection<User>('users');

    const users = await usersCollection.find().toArray();

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.log('Error in getAllUsers controller: ', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

module.exports = {
  getAllUsers,
};
