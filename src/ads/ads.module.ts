import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdsService } from './ads.service';
import { AdsSchema } from 'src/core/schemas/ads.schema';
import { AdsController } from './ads.controller';
import { AdsRepository } from 'src/core/repository/ads.repository';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Ads', schema: AdsSchema }]), UserModule],
  providers: [AdsService, AdsRepository],
  controllers: [AdsController],
})
export class AdsModule {}
