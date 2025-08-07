import { Prop } from "@nestjs/mongoose";
import { UserInterface } from "../dto/user.dto";

export const RequiredProps = (options: Partial<any> = {}) => {
  return Prop({ required: true, ...options });
}

export const UniqueProp = () => {
  return Prop({ unique: true });
}

export const DefaultProp = (value?: any) => {
  return Prop({ default: value })
}

export const loginUserField: (keyof UserInterface)[] = ["email", "firstName", "lastName", "authType"];