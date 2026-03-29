import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUrl()
  @IsOptional()
  url?: string;
}

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  name?: string;
}
