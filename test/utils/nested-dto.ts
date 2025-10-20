
import { IsInt, IsString, Min, Max, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class NestedDto {
  @IsString()
  name?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => ChildDto)
  child?: ChildDto;
}

export class ChildDto {
  @IsString()
  name?: string;

  @Min(0)
  @Max(100)
  @IsInt()
  @Type(() => Number) // Important for transformation
  age?: number;
}
