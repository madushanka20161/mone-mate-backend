import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { UserInterface } from "../dto/user.dto";
import moment from "moment";
import { DefaultProp, RequiredProps, UniqueProp } from "../helpers"
import { AuthType } from "../enum/authType.enum";

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User implements UserInterface {
    @RequiredProps()
    firstName: string;

    @RequiredProps()
    lastName: string;

    @RequiredProps()
    @UniqueProp()
    email: string;

    @DefaultProp()
    address: string;

    @DefaultProp(new Date(moment().format('YYYY-MM-DD')))
    createDate: Date;

    @DefaultProp(new Date())
    lastLogin: Date;

    @RequiredProps()
    authType: AuthType;
    
    id: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);