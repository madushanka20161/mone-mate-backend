import { HttpStatus } from '@nestjs/common';
import { UserInterface } from '../dto/user.dto';
import { loginUserField } from '../helpers';
import { CoreResponse } from './core.response';
import { Constant } from '../const';

export class LoginResponse implements CoreResponse {
  constructor(
    token: string,
    user: UserInterface,
    isNewUser: boolean,
    lastUpdatedTime: Date,
    ads?: { isAdsEnable: boolean; remaingCount: number }
  ) {
    this.token = token;
    this.statusCode = HttpStatus.OK;
    this.isNewUser = isNewUser;
    this.ads = {
      remaingCount: ads?.remaingCount ?? Constant.ads.requestCount,
      isAdsEnable: ads?.isAdsEnable ?? Constant.ads.isEnable,
    };
    this.lastUpdatedTime = lastUpdatedTime;

    loginUserField.forEach((key) => {
      this.user[key] = user[key];
    });
  }

  statusCode: number;
  token: string;
  user: any = {};
  isNewUser: boolean;
  ads: {
    isAdsEnable: boolean;
    remaingCount: number;
  };
  lastUpdatedTime: Date;
}
