import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  IsObject,
  ValidateIf,
} from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  posX: number;

  @IsNumber()
  posY: number;

  @IsObject()
  @IsOptional()
  selectionArea?: { x: number; y: number; width: number; height: number };

  @IsString()
  @IsOptional()
  pageUrl?: string;

  @IsString()
  @IsOptional()
  cssSelector?: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;

  @ValidateIf((o) => !o.authorId)
  @IsString()
  @IsOptional()
  guestName?: string;
}
