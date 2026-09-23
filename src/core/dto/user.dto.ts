import { Types } from 'mongoose';
import { AuthType } from '../enum/authType.enum';
import { UserRecode } from './userRecode.dto';

export interface UserInterface {
  id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  createDate: Date;
  lastLogin: Date;
  authType: AuthType;
  lastUpdatedTime: Date;
  recodes: UserRecode;
}

export class User implements UserInterface {
  id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  createDate: Date;
  lastLogin: Date;
  authType: AuthType;
  lastUpdatedTime: Date;
  recodes: UserRecode;
}
