import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Constant } from './core/const';
import { HelperModule } from './helper/helper.module';
import { AuthenticationMiddleware } from './core/middleware/authentication.middleware';
import { UserController } from './user/user.controller';
import { AdsModule } from './ads/ads.module';
import { AdsController } from './ads/ads.controller';

@Module({
  imports: [
    MongooseModule.forRoot(Constant.mongodbURL), 
    UserModule,
    HelperModule,
    AdsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer
    //   .apply(LoggerMiddleware)
    //   // .exclude({ path: 'user/login', method: RequestMethod.POST })
    //   .forRoutes(UserController, ClassController);

    consumer
      .apply(AuthenticationMiddleware)
      .exclude(
        { path: 'user', method: RequestMethod.POST },
        // { path: 'user/login', method: RequestMethod.POST },
      )
      .forRoutes(UserController, AdsController);
  }
}

