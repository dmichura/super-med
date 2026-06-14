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

export class CreateMedicalRecordDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  patientId: number;

  @IsString()
  @MinLength(2)
  doctorName: string;

  @IsString()
  @MinLength(2)
  departmentName: string;

  @IsEnum(MedicalRecordType)
  type: MedicalRecordType;

  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsEnum(MedicalRecordStatus)
  status?: MedicalRecordStatus;

  @IsOptional()
  @IsBoolean()
  isSensitive?: boolean;

  @IsString()
  @MinLength(5)
  description: string;
}
