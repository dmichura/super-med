import { DocumentStatus, DocumentType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

function transformBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (value === true || value === 'true') {
    return true;
  }

  if (value === false || value === 'false') {
    return false;
  }

  return undefined;
}

export class UpdateDocumentDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  patientId?: number;

  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @IsOptional()
  @IsString()
  @MinLength(3)
  fileName?: string;

  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @IsOptional()
  @Transform(({ value }) => transformBoolean(value))
  @IsBoolean()
  isSensitive?: boolean;
}
