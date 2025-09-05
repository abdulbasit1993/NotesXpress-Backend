import database from '../config/db';
import { Response } from 'express';
import { Note } from '../types/note';
import { Filter } from 'mongodb';
import { AuthenticatedRequest } from '../types/user';

const getUserStats = async (req: AuthenticatedRequest, res: Response) => {
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

    const notesCollection = db.collection<Note>('notes');

    const filter: Filter<Note> = { userId };

    const totalUserNotes = await notesCollection.countDocuments(filter);

    const latestNoteActivity = await notesCollection
      .aggregate([
        { $match: filter },
        {
          $addFields: {
            latestTimestamp: {
              $cond: {
                if: { $gt: ['$updatedAt', '$createdAt'] },
                then: '$updatedAt',
                else: '$createdAt',
              },
            },
          },
        },
        {
          $sort: {
            latestTimestamp: -1,
          },
        },
        {
          $limit: 1,
        },
        {
          $project: {
            latestTimestamp: 1,
          },
        },
      ])
      .toArray();

    const latestActivity =
      latestNoteActivity.length > 0
        ? latestNoteActivity[0].latestTimestamp
        : null;

    res.status(200).json({
      success: true,
      data: {
        totalUserNotes: totalUserNotes,
        latestActivity: latestActivity,
      },
    });
  } catch (error) {
    console.log('Error getting user stats: ', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

export = {
  getUserStats,
};
