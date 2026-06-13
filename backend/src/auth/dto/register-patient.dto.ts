import { IsEmail, IsString, Length, MinLength } from 'class-validator';

export class RegisterPatientDto {
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

  @IsString()
  @MinLength(8)
  password!: string;
}