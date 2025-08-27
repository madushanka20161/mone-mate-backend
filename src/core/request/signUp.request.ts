export interface SignUpRequest {
  authType: string; // auth type enum
  email: string;
  // google
  idToken: string;
}
