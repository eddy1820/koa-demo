export interface IAuthService {
  register(email: string, password: string): Promise<{
    user: {
      id: number;
      email: string;
      createdAt: Date;
    };
    token: string;
  }>;

  login(email: string, password: string): Promise<{
    user: {
      id: number;
      email: string;
      createdAt: Date;
    };
    token: string;
  }>;
}
