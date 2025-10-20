# Standard-class-validator

This package provides a utility function wrap [class-validator](https://github.com/typestack/class-validator) and make it [StandardSchema](https://standardschema.dev/) complient.

```ts
export class UserDto {
  @IsString()
  name?: string;

  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  age?: number;
}

const UserSchema = createStandardSchema(UserDto);
const validate = UserSchema["~standard"].validate;
```
