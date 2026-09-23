import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { User, UserInterface } from '../dto/user.dto';
import { UserDocument } from '../schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async createUser(user: UserInterface): Promise<UserInterface | null> {
    const createUser = new this.userModel(user);
    await createUser.save();

    return this.convertToCoreUser(createUser);
  }

  async updateUser(user: UserInterface): Promise<boolean> {
    try {
      const updateDetails = await this.userModel.updateOne(
        { email: user.email },
        {
          $set: {
            lastLogin: user.lastLogin,
            lastUpdatedTime: user.lastUpdatedTime,
            recodes: user.recodes
          },
        },
      );

      return updateDetails.modifiedCount > 0;
    } catch (error) {
      Logger.error('update user error', error.message);

      return false;
    }
  }

  async getUserByEmail(email: string): Promise<UserInterface | null> {
    return await this.getUser({ email });
  }

  async getUser(data: Partial<UserInterface>): Promise<UserInterface | null> {
    const users = await this.userModel.findOne(data);

    return this.convertToCoreUser(users);
  }

  async getAdminDetails() {
    const [row] = await this.userModel.aggregate([
      {
        $set: {
          startToday: { $dateTrunc: { date: '$$NOW', unit: 'day' } },
          startWeek: { $dateTrunc: { date: '$$NOW', unit: 'week' } },
          startMonth: { $dateTrunc: { date: '$$NOW', unit: 'month' } },
          startYear: { $dateTrunc: { date: '$$NOW', unit: 'year' } }
        }
      },
      {
        $set: {
          startYesterday: { $dateAdd: { startDate: '$startToday', unit: 'day', amount: -1 } },
          startTomorrow: { $dateAdd: { startDate: '$startToday', unit: 'day', amount: 1 } },
          nextWeek: { $dateAdd: { startDate: '$startWeek', unit: 'week', amount: 1 } },
          nextMonth: { $dateAdd: { startDate: '$startMonth', unit: 'month', amount: 1 } },
          nextYear: { $dateAdd: { startDate: '$startYear', unit: 'year', amount: 1 } } // ← added
        }
      },
      {
        $group: {
          _id: null,
          newUsersToday: {
            $sum: {
              $cond: [
                { $and: [{ $gte: ['$createDate', '$startToday'] }, { $lt: ['$createDate', '$startTomorrow'] }] },
                1, 0
              ]
            }
          },
          active1d: {
            $sum: {
              $cond: [
                { $and: [{ $gte: ['$lastLogin', '$startToday'] }, { $lt: ['$lastLogin', '$startTomorrow'] }] },
                1, 0
              ]
            }
          },
          active2d: {
            $sum: {
              $cond: [
                { $and: [{ $gte: ['$lastLogin', '$startYesterday'] }, { $lt: ['$lastLogin', '$startTomorrow'] }] },
                1, 0
              ]
            }
          },
          activeWeek: {
            $sum: {
              $cond: [
                { $and: [{ $gte: ['$lastLogin', '$startWeek'] }, { $lt: ['$lastLogin', '$nextWeek'] }] },
                1, 0
              ]
            }
          },
          activeMonth: {
            $sum: {
              $cond: [
                { $and: [{ $gte: ['$lastLogin', '$startMonth'] }, { $lt: ['$lastLogin', '$nextMonth'] }] },
                1, 0
              ]
            }
          },
          activeYear: {
            $sum: {
              $cond: [
                { $and: [{ $gte: ['$lastLogin', '$startYear'] }, { $lt: ['$lastLogin', '$nextYear'] }] },
                1, 0
              ]
            }
          }
        }
      },
      { $project: { _id: 0 } }
    ]).exec();
    

    return row ?? { newUsersToday: 0, active1d: 0, active2d: 0, activeWeek: 0, activeMonth: 0 };
  }

  // async getUserById(id: string): Promise<UserInterface> {
  //     const user = await this.userModel.findById(id);

  //     return this.convertToCoreUser(user);
  // }

  // async getUserList(data: Partial<StudentInterface>): Promise<UserInterface[]> {
  //     // const users = await this.userModel.find(data);
  //     const matchCondition = [];
  //     const conditionList: (keyof StudentInterface)[] = ["email", "gender", "firstName", "lastName", "accountStatus", "type"];
  //     const numberConditionList: (keyof StudentInterface)[] = ["grade", "mobileNumber"];

  //     conditionList.forEach(key => {
  //         if (data[key]) {
  //             matchCondition.push({[key]: data[key]});
  //         }
  //     });

  //     numberConditionList.forEach(key => {
  //         if (data[key]) {
  //             matchCondition.push({[key]: parseInt(data[key].toString())});
  //         }
  //     });

  //     if (data['name']) {
  //         matchCondition.push({fullName: { $regex: new RegExp(data['name'], 'i') }})
  //     }

  //     if (matchCondition.length === 0) {
  //         matchCondition.push({});
  //     }

  //     const users = await this.userModel.aggregate([
  //         {
  //             $addFields: {
  //               fullName: { $concat: ["$firstName", " ", "$lastName"] }
  //             }
  //           },
  //           {
  //             $match: {$and: matchCondition}
  //           }
  //     ]).exec();

  //     return this.convertToCoreUserList(users);
  // }

  convertToCoreUserList(users: UserDocument[]): UserInterface[] {
    return users
      .map((user) => this.convertToCoreUser(user))
      .filter((coreUser) => coreUser !== null);
  }

  convertToCoreUser(user: UserDocument | null): UserInterface | null {
    if (!user) return null;

    const coreUser = new User();

    Object.keys(user['_doc'] || user).forEach((key) => {
      if (key === '__v') return;

      if (key === '_id') coreUser.id = user['_id'];
      else coreUser[key] = user[key];
    });

    return coreUser;
  }
}
