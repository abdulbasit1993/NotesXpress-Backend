import { Request } from 'express';

declare namespace Express {
  interface Request {
    user?: {
      userId?: string;
    };
  }
}
