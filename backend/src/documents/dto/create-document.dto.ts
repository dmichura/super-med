import { DocumentStatus, DocumentType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateDocumentDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  patientId: number;

  @IsEnum(DocumentType)
  type: DocumentType;

  @IsString()
  @MinLength(3)
  fileName: string;

  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @IsOptional()
  @IsBoolean()
  isSensitive?: boolean;
}
