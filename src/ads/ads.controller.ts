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
import type { UpdateAdsErrorsRequest } from 'src/core/request/updateAdsErrors.request';
import type { UpdateAdsHistoryRequest } from 'src/core/request/updateAdsHistory.request';
import { AdsType } from 'src/core/enum/adsType.enum';

@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) { }

  @Post('remainingCount')
  async updateRemaingCount(@Req() request: CoreRequest, @Body() body: RemainingAdsCountRequest) {
    Logger.log(`update ads remaining count - email: ${request.authUser.email}, count: ${body.count}`);

    if (isNaN(Number(body.count)) || body.count < 0) throw new GeneralExeption(`invalid remaining count: ${body.count}`);

    try {
      return await this.adsService.updateRemainingCount(request.authUser.email, body.count);
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

  @Post('errors')
  async updateErrors(@Req() request: CoreRequest, @Body() body: UpdateAdsErrorsRequest) {
    Logger.log(`update ads errors - email: ${request.authUser.email}, errors count: ${body.errors.length}, remainingCount: ${body.remainingCount}`);

    try {
      return await this.adsService.updateErrors(request.authUser.email, body);
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

  @Post('history')
  async updateLoadHistory(@Req() request: CoreRequest, @Body() body: UpdateAdsHistoryRequest) {
    Logger.log(`update ads history - email: ${request.authUser.email}, type: ${body.type}, remainingCount: ${body.remainingCount}`);
    
    if (!Object.values(AdsType).includes(body.type)) {
      Logger.error(`Invalid ads type: ${body.type}`);
      throw new GeneralExeption(`Invalid ads type: ${body.type}`);
    }

    try {
      return await this.adsService.updateLoadHistory(request.authUser.email, body);
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
