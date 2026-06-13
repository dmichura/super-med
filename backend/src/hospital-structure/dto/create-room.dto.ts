import { IsString, MinLength } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @MinLength(1)
  number: string;

  @IsString()
  @MinLength(2)
  type: string;
}
