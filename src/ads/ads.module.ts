import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdsService } from './ads.service';
import { Ads, AdsSchema } from 'src/core/schemas/ads.schema';
import { AdsController } from './ads.controller';
import { AdsRepository } from 'src/core/repository/ads.repository';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Ads.name, schema: AdsSchema }]), forwardRef(() => UserModule)],
  providers: [AdsService, AdsRepository],
  controllers: [AdsController],
  exports: [AdsService, AdsRepository],
})
export class AdsModule {}
