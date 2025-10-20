import "reflect-metadata"
import { describe, it, expect } from 'vitest';
import { UserDto } from './utils/user.dto';
import { createStandardSchema } from '../src';
import { NestedDto } from "./utils/nested-dto";

const UserSchema = createStandardSchema(UserDto);
const validate = UserSchema['~standard'].validate;

describe('StandardSchemaV1 Wrapper for class-validator/class-transformer', () => {

  // Test Case 1: Successful Transformation and Validation
  it('should successfully transform and validate good data, returning the class instance', async () => {
    const goodData = { name: 'Alice', age: '25' };

    // The validate function should return the validated/transformed output (UserDto instance)
    const result = await validate(goodData);

    // 1. Check for success (not an object with 'issues')
    expect(result).not.toHaveProperty('issues');

    // 2. Check for transformation (string '25' to number 25)
    expect(result).toEqual({ name: 'Alice', age: 25 });

    // 3. Check for correct type (instance of UserDto)
    expect(result).toBeInstanceOf(UserDto);

    // 4. Verify class-transformer functionality (accessing a class method if UserDto had one)
    // For example: expect(result.getGreeting()).toBe('Hello Alice');
  });

  // Test Case 2: Validation Failure (Wrong Data Type)
  it('should fail validation and return an object with standardized issues for invalid age', async () => {
    const badData = { name: 'Bob', age: 'not-a-number' };

    // The validate function should return an error object: { issues: [...] }
    const result = await validate(badData);

    // 1. Check for failure (must have 'issues' property)
    expect(result).toHaveProperty('issues');

    // 2. Check for at least one validation issue
    expect((result as any).issues.length).toBeGreaterThan(0);

    // 3. Check the structure of the validation issue (Standard Schema V1 error format)
    expect((result as any).issues[0]).toEqual(
      expect.objectContaining({
        path: ['age'], // The property name
        message: expect.any(String), // The error message from class-validator
      })
    );
  });

  // Test Case 3: Validation Failure (Constraint Violation - Min/Max)
  it('should fail validation for an age outside the allowed range', async () => {
    const outOfRangeData = { name: 'Charlie', age: 150 }; // Max is 100 in DTO

    const result = await validate(outOfRangeData);

    // 1. Check for failure and the correct property path
    expect(result).toHaveProperty('issues');
    expect((result as any).issues.find((i: any) => i.path.join(".") === 'age')).toBeTruthy();
  });

  // Test Case 4: Handling Extraneous Properties (Whitelisting/Forbidding Unknown)
  it('should handle extraneous properties based on class-validator options', async () => {
    const extraData = { name: 'David', age: 40, extraField: 'should be stripped' };

    // Assuming the wrapper uses { whitelist: true, forbidNonWhitelisted: true }
    const result = await validate(extraData);

    // With forbidNonWhitelisted: true, this should typically fail
    // If your wrapper only uses 'whitelist: true', the validation should pass, and the output should *not* contain 'extraField'.

    // ***Adjust expectation based on your actual wrapper implementation's options***

    // If your wrapper uses { forbidNonWhitelisted: true }:
    expect(result).toHaveProperty('issues');
    expect((result as any).issues[0].message).toContain('property extraField should not exist');

    /* // If your wrapper *only* uses { whitelist: true }:
    const validatedInstance = await validate({ name: 'David', age: 40, extraField: 'should be stripped' });
    expect(validatedInstance).toEqual({ name: 'David', age: 40 });
    expect(validatedInstance).not.toHaveProperty('extraField');
    */
  });


  // Test Case 5: Handling nested object Properties (Whitelisting/Forbidding Unknown)
  it('should handle nested properties based on class-validator options', async () => {

    const NestedSchema = createStandardSchema(NestedDto);
    const validate = NestedSchema['~standard'].validate;

    const extraData = { name: 'David', child: { name: "John", age: "string" } };

    // Assuming the wrapper uses { whitelist: true, forbidNonWhitelisted: true }
    const result = await validate(extraData);

    // With forbidNonWhitelisted: true, this should typically fail
    // If your wrapper only uses 'whitelist: true', the validation should pass, and the output should *not* contain 'extraField'.

    // ***Adjust expectation based on your actual wrapper implementation's options***

    // If your wrapper uses { forbidNonWhitelisted: true }:
    // console.log(result.issues.map(x => ({ path: x.path ? x.path.join(".") : "", messaage: x.message })))
    expect(result).toHaveProperty('issues');
    expect((result as any).issues[0].message).toContain('Validation error');
    expect((result as any).issues[1].message).toContain('age must be an integer number');

    /* // If your wrapper *only* uses { whitelist: true }:
    const validatedInstance = await validate({ name: 'David', age: 40, extraField: 'should be stripped' });
    expect(validatedInstance).toEqual({ name: 'David', age: 40 });
    expect(validatedInstance).not.toHaveProperty('extraField');
    */
  });
});
