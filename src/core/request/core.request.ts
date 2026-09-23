export interface CoreRequest extends Request {
  authUser: {email: string};
}