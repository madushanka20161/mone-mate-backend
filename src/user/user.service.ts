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
import { Ads } from 'src/core/dto/ads.dto';
import { AdsRepository } from 'src/core/repository/ads.repository';

@Injectable()
export class UserService {
  private oauthClient: OAuth2Client;
  private CLIENT_ID: string;

  constructor(
    private userRepository: UserRepository,
    private adsRepository: AdsRepository,
  ) {
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

        const ads: Partial<Ads> = {
          remainingCount: Constant.ads.requestCount,
          remainingCountUpdatedAt: new Date(),
          userId: user.id
        }

        const newAds = this.adsRepository.updateAds(ads);

        if (!newAds) {
          if (!user) {
            Logger.error(`Failed to create ads - ${userEmail}`);
            throw new GeneralExeption('User creation failed');
          }
        }
      } else {
        user!.lastLogin = new Date();
        await this.userRepository.updateUser(user!);
      }

      const token = jwt.sign({ email: user!.email }, Constant.JWT.secret, {
        expiresIn: Constant.JWT.expireIn,
      });

      const ads = await this.adsRepository.getAdsByUserId(user!.id.toString());

      const isAdsEnable = this._isAdsEnable(user?.createDate, ads!);
      const remaingCount = this._adsRemaingCount(ads!);
      const isAdsReqEnable = ads?.isAdsReqEnable ?? true;

      return new LoginResponse(token, user!, isNewUser, user!.lastUpdatedTime, { isAdsEnable, remaingCount, isAdsReqEnable });
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

  async getAdminDetails() {
    return await this.userRepository.getAdminDetails();
  }

  _adsRemaingCount = (ads: Ads | undefined) : number => {
    const requestCount = Constant.ads.requestCount;

    if (!ads) return requestCount;

    if (ads.remainingCount === requestCount) return requestCount;

    const lastUpdated = new Date(ads?.remainingCountUpdatedAt);
    const now = new Date();

    /* TODO: [need to compire performance and use suitable one]
    const isSameDay = lastUpdated.getUTCFullYear() === now.getUTCFullYear() && lastUpdated.getUTCMonth() === now.getUTCMonth() && lastUpdated.getUTCDate() === now.getUTCDate();
    */
    if (lastUpdated.toISOString().split("T")[0] === now.toISOString().split("T")[0]) return ads.remainingCount;

    ads.remainingCount = requestCount;

    // TODO: [Need to test whethere we need to update the count or not]
    // this.adsRepository.updateAds(ads);

    return requestCount;
  }

  _isAdsEnable = (createdDate: Date | undefined, ads: Ads | undefined): boolean => {
    if (createdDate === undefined) return true;

    if (ads && !ads.isAdsEnable) return ads.isAdsEnable;

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
