import { Injectable, Logger } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { User } from 'src/core/dto/user.dto';
import { AuthType } from 'src/core/enum/authType.enum';
import { GeneralExeption } from 'src/core/exception/general.exception';
import { UserRepository } from 'src/core/repository/user.repository';
import { SignUpRequest } from 'src/core/request/signUp.request';
import { LoginResponse } from 'src/core/response/login.response';
import * as jwt from 'jsonwebtoken';
import { Constant } from 'src/core/const';
import { UpdateUserRecodeRequest } from 'src/core/request/updateUserRecode.request';
import { GeneralResponse } from 'src/core/response/general.response';

@Injectable()
export class UserService {
  private oauthClient: OAuth2Client;
  private CLIENT_ID: string;

  constructor(private userRepository: UserRepository) {
    this.CLIENT_ID = Constant.googleClientId;
    this.oauthClient = new OAuth2Client(this.CLIENT_ID);
  }

  async signUpWithGoogle(request: SignUpRequest) {
    try {
      const googleUser = await this.oauthClient.verifyIdToken({
        idToken: request.idToken,
        audience: this.CLIENT_ID,
      });

      const payload = googleUser.getPayload();
      const userEmail = payload?.email;

      if (!payload || !userEmail) {
        Logger.error(
          `Invalid Google token or missing email - ${request.idToken}`,
        );
        throw new GeneralExeption('Invalid token');
      }

      let user = await this.userRepository.getUserByEmail(userEmail);

      const isNewUser = !user;

      if (isNewUser) {
        const newUser = new User();
        newUser.authType = AuthType.GOOGLE;
        newUser.firstName = payload.given_name ?? '';
        newUser.lastName = payload.family_name ?? '';
        newUser.email = userEmail;

        user = await this.userRepository.createUser(newUser);

        if (!user) {
          Logger.error(`Failed to create user - ${userEmail}`);
          throw new GeneralExeption('User creation failed');
        }
      } else {
        user!.lastLogin = new Date();
        await this.userRepository.updateUser(user!);
      }

      const token = jwt.sign({ email: user!.email }, Constant.JWT.secret, {
        expiresIn: Constant.JWT.expireIn,
      });

      const isAdsEnable = this._isAdsEnable(user?.createDate);

      return new LoginResponse(token, user!, isNewUser, user!.lastUpdatedTime, { isAdsEnable });
    } catch (e) {
      Logger.error(e.message);
      throw new GeneralExeption('TOKEN_VERIFICATION_FAIL');
    }
  }

  async updateUserRecode(email: string, recods: UpdateUserRecodeRequest) {
    const user = await this.userRepository.getUserByEmail(email);
    
    if (!user) {
      Logger.error(`update recode issue - cannot find auth user: ${email}`);
      throw new GeneralExeption('INVALID_AUTH_USER');
    }

    user.recodes = recods;
    user.lastUpdatedTime = new Date();
    
    const isUpdated = await this.userRepository.updateUser(user);
    
    if (!isUpdated) Logger.error(`update recode issue - size of recodes: ${(JSON.stringify(recods).length/(1024*1024)).toFixed(2)}MB`);

    return new GeneralResponse();
  }

  _isAdsEnable = (createdDate: Date | undefined): boolean => {
    if (createdDate === undefined) return false;

    const today = new Date();
    const diffMs = today.getTime() - createdDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays > 30) {
      return true;
    } else {
      return false;
    }
  }

  async getAuthUser(email: string): Promise<User> {
    const user = await this.userRepository.getUserByEmail(email);
    
    if (!user) {
      Logger.error(`update recode issue - cannot find auth user: ${email}`);
      throw new GeneralExeption('INVALID_AUTH_USER');
    }

    return user;
  }
}
