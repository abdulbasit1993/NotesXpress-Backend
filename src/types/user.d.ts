export type UserRole = 'USER' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  _id?: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}
