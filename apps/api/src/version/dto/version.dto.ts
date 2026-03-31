import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateVersionDto {
  @IsString()
  @IsNotEmpty()
  versionName: string;

  @IsUrl({ require_tld: false })
  url: string;

  @IsString()
  @IsOptional()
  memo?: string;
}
