import { HttpException, HttpStatus } from '@nestjs/common';

export class GeneralExeption extends HttpException {
  constructor(message: any, status: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(message, status);
  }
}
