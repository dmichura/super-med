import { Type } from 'class-transformer';
import { IsInt, IsString, Min, MinLength } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(2)
  code: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  floor: number;

  @IsString()
  @MinLength(2)
  headDoctorName: string;
}
