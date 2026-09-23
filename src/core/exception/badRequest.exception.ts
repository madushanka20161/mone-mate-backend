import { HttpException, HttpStatus } from '@nestjs/common';

export class BadRequestException extends HttpException {
  constructor(message: any) {
    super(`Bad Request ${message}`, HttpStatus.BAD_REQUEST);
  }
}
