import { Types } from "mongoose";
import { AdsHistory } from "./adsHistory.dto";

export interface AdsInterface {
  id: Types.ObjectId;
  userId: Types.ObjectId;
  remainingCount: number;
  remainingCountUpdatedAt: Date;
  isAdsEnable: boolean;
  isAdsReqEnable: boolean;
  history: AdsHistory[];
  errors: string[];
}

export class Ads implements AdsInterface {
  id: Types.ObjectId;
  userId: Types.ObjectId;
  remainingCount: number;
  remainingCountUpdatedAt: Date;
  isAdsEnable: boolean;
  isAdsReqEnable: boolean;
  history: AdsHistory[];
  errors: string[];
}