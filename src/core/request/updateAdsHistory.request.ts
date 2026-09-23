import { AdsType } from "../enum/adsType.enum";

export interface UpdateAdsHistoryRequest {
  type: AdsType;
  remainingCount: number;
}
