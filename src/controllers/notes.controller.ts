import database from '../config/db';
import { Request, Response } from 'express';
import { Note } from '../types/note';
import { Filter, ObjectId } from 'mongodb';

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

const getAllUserNotes = async (
  req: Request & {
    user?: {
      userId?: string;
    };
  },
  res: Response,
): Promise<void> => {
  try {
    const db = database.getDb();
    const userId = req?.user?.userId;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'User ID is required',
      });

      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const notesCollection = db.collection<Note>('notes');

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

    const filter: Filter<Note> = { userId };

    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      filter.$or = [{ title: searchRegex }, { content: searchRegex }];
    }

    const skip = (page - 1) * limit;

    const totalUserNotes = await notesCollection.countDocuments(filter);
    const totalPages = Math.ceil(totalUserNotes / limit);

    const notes = await notesCollection
      .find(filter)
      .skip(skip)
      .limit(limit)
      .toArray();

    res.status(200).json({
      success: true,
      data: notes,
      pagination: {
        page,
        limit,
        totalPages,
        totalUserNotes,
      },
    });
  } catch (error) {
    console.log('Error in getAllUserNotes controller: ', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

const getSingleNote = async (req: Request, res: Response): Promise<void> => {
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

    const notesCollection = db.collection<Note>('notes');

    const note = await notesCollection.findOne({ _id: new ObjectId(id) });

    if (!note) {
      res.status(404).json({
        success: false,
        message: 'Note not found',
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (error) {
    console.log('Error in getSingleNote controller: ', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

const updateNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });

      return;
    }

    const db = database.getDb();

    const notesCollection = db.collection<Note>('notes');

    const note = await notesCollection.findOne({ _id: new ObjectId(id) });

    if (!note) {
      res.status(404).json({
        success: false,
        message: 'Note not found',
      });

      return;
    }

    const updatedNote = {
      title: title || note.title,
      content: content || note.content,
      updatedAt: new Date(),
    };

    const result = await notesCollection.findOneAndUpdate(
      {
        _id: new ObjectId(id),
      },
      {
        $set: updatedNote,
      },
      {
        returnDocument: 'after',
      },
    );

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: result,
    });
  } catch (error) {
    console.log('Error in updateNote controller: ', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

const deleteNote = async (req: Request, res: Response): Promise<void> => {
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

    const notesCollection = db.collection<Note>('notes');

    const note = await notesCollection.findOne({ _id: new ObjectId(id) });

    if (!note) {
      res.status(404).json({
        success: false,
        message: 'Note not found',
      });

      return;
    }

    await notesCollection.deleteOne({ _id: new ObjectId(id) });

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    console.log('Error in deleteNote controller: ', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

module.exports = {
  createNote,
  getAllUserNotes,
  getSingleNote,
  updateNote,
  deleteNote,
};
