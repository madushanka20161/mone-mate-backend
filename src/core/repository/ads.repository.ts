import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Ads, AdsInterface } from "../dto/ads.dto";
import { Model, Types } from "mongoose";
import { AdsModule } from "src/ads/ads.module";
import { AdsDocument } from "../schemas/ads.schema";

@Injectable()
export class AdsRepository {
  constructor(
    @InjectModel(Ads.name)
    private adsModel: Model<AdsModule>,
  ) { }

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

  // convertToCoreUserList(users: UserDocument[]): UserInterface[] {
  //   return users
  //     .map((user) => this.convertToCoreUser(user))
  //     .filter((coreUser) => coreUser !== null);
  // }

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