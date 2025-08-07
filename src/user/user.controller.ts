import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import type { SignUpRequest } from 'src/core/request/signUp.request';
import { AuthType } from 'src/core/enum/authType.enum';
import { GeneralExeption } from 'src/core/exception/general.exception';
import { BadRequestException } from 'src/core/exception/badRequest.exception';
import { Constant } from 'src/core/const';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async signIn(@Body() request: SignUpRequest) {
    Logger.log(`signin - ${request}`);
    if (request === undefined) throw new BadRequestException('');

    try {
      if (request.authType === AuthType.GOOGLE as string) {
        return await this.userService.signUpWithGoogle(request);
      } else {
        throw new GeneralExeption(`invalid auth type ${request.authType}`);
      }
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
