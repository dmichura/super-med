import { MedicalRecordStatus, MedicalRecordType } from '@prisma/client';
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

export class UpdateMedicalRecordDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  patientId?: number;

  @IsOptional()
  @IsString()
  @MinLength(2)
  doctorName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  departmentName?: string;

  @IsOptional()
  @IsEnum(MedicalRecordType)
  type?: MedicalRecordType;

  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsEnum(MedicalRecordStatus)
  status?: MedicalRecordStatus;

  @IsOptional()
  @IsBoolean()
  isSensitive?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(5)
  description?: string;
}
