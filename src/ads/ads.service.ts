import { Injectable, Logger } from '@nestjs/common';
import { Ads } from 'src/core/dto/ads.dto';
import { AdsRepository } from 'src/core/repository/ads.repository';
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

    const ads: Partial<Ads> = {
      userId: user.id,
      remainingCount: count,
    }

    const isUpdated = await this.adsRepository.updateAds(ads);

    if (!isUpdated) Logger.error(`update ads remaining count - count: ${count}`);
    
    return new GeneralResponse();
  }
}
