import { Request } from 'express';
import { ObjectId } from 'mongodb';

export type UserRole = 'USER' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  _id?: ObjectId | string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    userId?: string;
  };
}
