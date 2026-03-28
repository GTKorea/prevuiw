import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateVersionDto {
  @IsString()
  @IsNotEmpty()
  versionName: string;

  @IsUrl()
  url: string;

  @IsString()
  @IsOptional()
  memo?: string;
}
