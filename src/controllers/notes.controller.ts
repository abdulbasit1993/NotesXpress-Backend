import database from '../config/db';
import { Request, Response } from 'express';
import { Note } from '../types/note';
import { ObjectId } from 'mongodb';

const createNote = async (
  req: Request & {
    user?: {
      userId?: string;
    };
  },
  res: Response,
): Promise<void> => {
  try {
    const db = database.getDb();
    const { title, content } = req.body;
    const userId = req?.user?.userId;

    if (!content) {
      res.status(400).json({
        success: false,
        message: 'Content is required',
      });

      return;
    }

    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'User ID is required',
      });

      return;
    }

    const notesCollection = db.collection<Note>('notes');

    const newNote = {
      title,
      content,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await notesCollection.insertOne(newNote);

    if (!result.insertedId) {
      res.status(500).json({
        success: false,
        message: 'Failed to create note',
      });

      return;
    }

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: {
        id: result.insertedId.toString(),
        ...newNote,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

module.exports = {
  createNote,
};
