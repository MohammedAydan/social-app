export type AuthUser = {
  id: string;
  username?: string;
  email?: string;
  avatar?: string | null;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
};
