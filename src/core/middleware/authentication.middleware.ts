import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { GeneralExeption } from "../exception/general.exception";
import * as jwt from "jsonwebtoken";
import { Constant } from "../const";
import { UserInterface } from "../dto/user.dto";
import { HelperService } from "src/helper/helper.service";
import type { CoreRequest } from "../request/core.request";

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(private readonly helperService: HelperService) { }

  async use(req: CoreRequest, res: any, next: (error?: Error | any) => void) {
    const token = this.helperService.getToken(req);

    await jwt.verify(token, Constant.JWT.secret, async (error: any, user: UserInterface) => {
      if (error) {
        Logger.log(`token verification faile - token: ${token}`);
        throw new GeneralExeption(`Authentication fail - ${error.message}`);
      }

      req.authUser = user;

      next();
    });
  }
}