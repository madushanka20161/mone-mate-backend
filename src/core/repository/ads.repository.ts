import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Ads, AdsInterface } from "../dto/ads.dto";
import { Model, Types } from "mongoose";
import { AdsDocument } from "../schemas/ads.schema"; 

@Injectable()
export class AdsRepository {
  constructor(
    @InjectModel(Ads.name)
    private adsModel: Model<AdsDocument>,
  ) { }

  async getAdsByUserId(userId: string): Promise<AdsInterface | null> {
    const ads = await this.adsModel.findOne({userId: new Types.ObjectId(userId)});

    return this.convertToCoreObject(ads);
  }

  async getAds(data: Partial<AdsInterface>): Promise<AdsInterface | null> {
    const ads = await this.adsModel.findOne(data);
  
    return this.convertToCoreObject(ads);
  }

  async updateAds(ads: Partial<AdsInterface>): Promise<boolean> {
    try {
      const updateDetails = await this.adsModel.findOneAndUpdate(
        { userId: new Types.ObjectId(ads.userId) },
        { $set: ads },
        { new: true, upsert: true }
      );

      return !!updateDetails;
    } catch (error) {
      Logger.error('update ads error', error.message);

      return false;
    }
  }

  convertToCoreObject(document: AdsDocument | null): AdsInterface | null {
    if (!document) return null;

    const coreObject = new Ads();

    Object.keys(document['_doc'] || document).forEach((key) => {
      if (key === '__v') return;

      if (key === '_id') coreObject.id = document['_id'];
      else coreObject[key] = document[key];
    });

    return coreObject;
  }
}