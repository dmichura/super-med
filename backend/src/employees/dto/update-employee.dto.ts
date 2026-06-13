import { EmployeeFunction } from '@prisma/client';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export type EmployeeSystemRole = 'ADMIN' | 'DIRECTOR' | 'EMPLOYEE';

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(7)
  phoneNumber?: string;

  @IsOptional()
  @IsIn(['ADMIN', 'DIRECTOR', 'EMPLOYEE'])
  systemRole?: EmployeeSystemRole;

  @IsOptional()
  @IsEnum(EmployeeFunction)
  employeeFunction?: EmployeeFunction;

  @IsOptional()
  @IsString()
  departmentName?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
