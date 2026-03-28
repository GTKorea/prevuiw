export class OAuthUserDto {
  email: string;
  name: string;
  avatarUrl?: string;
  provider: 'GOOGLE' | 'GITHUB';
  providerId: string;
}

export class AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  };
}
