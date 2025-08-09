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
        // newUser.firstName = payload.given_name ?? '';
        newUser.firstName = request.idToken;
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

      return new LoginResponse(token, user!, isNewUser);
    } catch (e) {
      Logger.error(e);
      throw new GeneralExeption('Token verification failed');
    }
  }
}
