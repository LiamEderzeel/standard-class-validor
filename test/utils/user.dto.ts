import { IsInt, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UserDto {
  @IsString()
  name?: string;

  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number) // Important for transformation
  age?: number;
}
