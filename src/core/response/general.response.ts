import { HttpStatus } from '@nestjs/common';
import { CoreResponse } from './core.response';

export class GeneralResponse implements CoreResponse {
  constructor() {
    this.statusCode = HttpStatus.OK;
  }

  statusCode: number;
}
