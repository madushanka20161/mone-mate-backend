import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import { AdsService } from './ads.service';
import type { RemainingAdsCountRequest } from 'src/core/request/remainingAdsCount.request';
import { GeneralExeption } from 'src/core/exception/general.exception';
import type { CoreRequest } from 'src/core/request/core.request';

@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Post('remainingCount')
    async updateRemaingCount(@Req() request: CoreRequest, @Body() body: RemainingAdsCountRequest) {
      Logger.log(`update ads remaining count - email: ${request.authUser.email}, count: ${body.count}`);

      if (isNaN(Number(body.count)) || body.count < 0) throw new GeneralExeption(`invalid remaining count: ${body.count}`);

      try {
        return this.adsService.updateRemainingCount(request.authUser.email, body.count);
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
}
