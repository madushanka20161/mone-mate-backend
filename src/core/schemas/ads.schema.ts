import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AdsType } from '../enum/adsType.enum';
import { AdsInterface } from '../dto/ads.dto';
import { AdsHistoryInterface } from '../dto/adsHistory.dto';
import { DefaultProp } from '../helpers';

export type AdsDocument = HydratedDocument<Ads>;

class AdsHistory implements AdsHistoryInterface {
  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: String, enum: AdsType, required: true })
  type: AdsType;
}

@Schema()
export class Ads implements AdsInterface {
  @Prop({ type: Types.ObjectId, ref: 'User', unique: true, required: true })
  userId: Types.ObjectId; // reference to User

  @Prop({ default: 0 })
  remainingCount: number;

  @DefaultProp(new Date())
  remainingCountUpdatedAt: Date;

  @Prop({ default: true })
  isAdsEnable: boolean;

  @Prop({ default: true })
  isAdsReqEnable: boolean;

  @Prop({ type: [AdsHistory], default: [] })
  history: [AdsHistory]

  @Prop({
    type: [String],
    default: [],
    set: (errors: string[]) => {
      if (errors.length > 50) {
        return errors.slice(errors.length - 50);
      }
      return errors;
    },
  })
  errors: string[];
  id: Types.ObjectId;
}

export const AdsSchema = SchemaFactory.createForClass(Ads);
