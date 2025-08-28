import { AdsType } from "../enum/adsType.enum";

export interface AdsHistoryInterface {
  date: Date;
  type: AdsType;
}

export class AdsHistory {
  date: Date;
  type: AdsType;
}