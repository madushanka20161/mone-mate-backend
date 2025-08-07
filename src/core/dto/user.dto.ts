import { Types } from 'mongoose';
import { AuthType } from '../enum/authType.enum';

export interface UserInterface {
  id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  createDate: Date;
  lastLogin: Date;
  authType: AuthType;
}

export class User implements UserInterface {
  id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  createDate: Date;
  lastLogin: Date;
  authType: AuthType;
}
