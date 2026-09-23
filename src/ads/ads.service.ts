import { Injectable, Logger } from '@nestjs/common';
import { AdsHistory } from 'src/core/dto/adsHistory.dto';
import { AdsType } from 'src/core/enum/adsType.enum';
import { GeneralExeption } from 'src/core/exception/general.exception';
import { AdsRepository } from 'src/core/repository/ads.repository';
import { UpdateAdsErrorsRequest } from 'src/core/request/updateAdsErrors.request';
import { UpdateAdsHistoryRequest } from 'src/core/request/updateAdsHistory.request';
import { GeneralResponse } from 'src/core/response/general.response';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AdsService {
  constructor(
    private adsRepository: AdsRepository,
    private userService: UserService,
  ) {}

  async updateRemainingCount(email: string, count: number) {
    const user = await this.userService.getAuthUser(email);
    const ads = await this.adsRepository.getAdsByUserId(user.id.toString());

    if (!ads) {
      Logger.error(`Ads not found for user: ${email}`);
      throw new GeneralExeption(`Ads not found for user: ${email}`);
    }

    ads.remainingCount = count;
    ads.remainingCountUpdatedAt = new Date();

    const isUpdated = await this.adsRepository.updateAds(ads);

    if (!isUpdated) Logger.error(`Errors in update ads remaining count - user: ${email}, count: ${count}`);
    
    return new GeneralResponse();
  }

  async updateErrors(email: string, data: UpdateAdsErrorsRequest) {
    const user = await this.userService.getAuthUser(email);
    const ads = await this.adsRepository.getAdsByUserId(user.id.toString());

    if (!ads) {
      Logger.error(`Ads not found for user: ${email}`);
      throw new GeneralExeption(`Ads not found for user: ${email}`);
    }

    ads.errors.push(...data.errors);
    ads.remainingCount = data.remainingCount ?? ads.remainingCount;
    ads.remainingCountUpdatedAt = new Date();

    const isUpdated = await this.adsRepository.updateAds(ads);

    if (!isUpdated) Logger.error(`Errors in update ads errors user: ${email}, erros length: ${data.errors.length}`);
    
    return new GeneralResponse();
  }

  async updateLoadHistory(email: string, data: UpdateAdsHistoryRequest) {
    const user = await this.userService.getAuthUser(email);
    const ads = await this.adsRepository.getAdsByUserId(user.id.toString());

    if (!ads) {
      Logger.error(`Ads not found for user: ${email}`);
      throw new GeneralExeption(`Ads not found for user: ${email}`);
    }

    const adsHistory: AdsHistory = {
      type: data.type as AdsType,
      date: new Date()
    }

    ads.history.push(adsHistory);
    ads.remainingCount = data.remainingCount ?? ads.remainingCount;
    ads.remainingCountUpdatedAt = new Date();

    const isUpdated = await this.adsRepository.updateAds(ads);

    if (!isUpdated) Logger.error(`Errors in update ads history user: ${email}, ads type: ${data.type}`);
    
    return new GeneralResponse();
  }
}
