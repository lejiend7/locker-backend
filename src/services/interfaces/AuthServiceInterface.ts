export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'delivery_agent' | 'admin';
};

export type AuthResult =
  | {
      success: true;
      message: string;
      data: {
        accessToken: string;
        user: AuthUser;
      };
    }
  | {
      success: false;
      message: string;
    };

export interface AuthServiceInterface {
  signup(input: { name?: string; email?: string; password?: string; role?: string }): Promise<AuthResult>;
  signupAdmin(input: { name?: string; email?: string; password?: string }): Promise<AuthResult>;
  login(input: { email?: string; password?: string }): Promise<AuthResult>;
}
