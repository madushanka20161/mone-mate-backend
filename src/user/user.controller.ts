import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import type { SignUpRequest } from 'src/core/request/signUp.request';
import { AuthType } from 'src/core/enum/authType.enum';
import { GeneralExeption } from 'src/core/exception/general.exception';
import { BadRequestException } from 'src/core/exception/badRequest.exception';
import type { UpdateUserRecodeRequest } from 'src/core/request/updateUserRecode.request';
import type { CoreRequest } from 'src/core/request/core.request';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async signIn(@Body() request: SignUpRequest) {
    Logger.log(`signin - authType: ${request.authType}, email: ${request.email}`);
    if (request === undefined) throw new BadRequestException('');

    try {
      if (request.authType === (AuthType.GOOGLE as string)) {
        return await this.userService.signUpWithGoogle(request);  
      } else {
        throw new GeneralExeption(`invalid auth type ${request.authType}`);
      }
    } catch (error) {
      Logger.error(error.message);
      
      if (error.status) {
        throw new HttpException(error.message, error.status);
      } else {
        throw new HttpException(
          'SERVER_ERROR',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Post('records')
  async updateUserRecode(@Req() request: CoreRequest, @Body() body: UpdateUserRecodeRequest) {
    Logger.log(`update recode - email: ${request.authUser.email}, size of recodes: ${(JSON.stringify(body).length/(1024*1024)).toFixed(2)}MB`);

    try {
      return this.userService.updateUserRecode(request.authUser.email, body);
    } catch (error) {
      if (error.status) {
        throw new HttpException(error.message, error.status);
      } else {
        throw new HttpException(
          'SERVER_ERROR',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
