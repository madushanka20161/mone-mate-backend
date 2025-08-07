import { HttpStatus } from "@nestjs/common";
import { UserInterface } from "../dto/user.dto";
import { loginUserField } from "../helpers";
import { CoreResponse } from "./core.response";

export class LoginResponse implements CoreResponse {
  constructor(token: string, user: UserInterface, isNewUser: boolean) {
    this.token = token;
    this.statusCode = HttpStatus.OK;
    this.isNewUser = isNewUser;

    loginUserField.forEach(key => {
      this.user[key] = user[key];
    });
  }

  statusCode: number;
  token: string;
  user: any = {};
  isNewUser: boolean;
}