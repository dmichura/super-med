import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class CreatePatientDto {
  @IsString()
  @MinLength(2)
  firstName!: string;

  @IsString()
  @MinLength(2)
  lastName!: string;

  @IsString()
  @Length(11, 11)
  pesel!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  assignedDoctorName?: string | null;
}
