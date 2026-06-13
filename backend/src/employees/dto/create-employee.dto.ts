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

export class CreateEmployeeDto {
  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(7)
  phoneNumber: string;

  @IsIn(['ADMIN', 'DIRECTOR', 'EMPLOYEE'])
  systemRole: EmployeeSystemRole;

  @IsEnum(EmployeeFunction)
  employeeFunction: EmployeeFunction;

  @IsOptional()
  @IsString()
  departmentName?: string | null;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
