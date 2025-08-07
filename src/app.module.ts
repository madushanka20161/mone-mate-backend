import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Constant } from './core/const';

@Module({
  imports: [
    MongooseModule.forRoot(Constant.mongodbURL),
    UserModule
  ],
  
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
