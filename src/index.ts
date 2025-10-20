import { validate, ValidationError, ValidatorOptions } from 'class-validator';
import { ClassTransformOptions, plainToInstance } from 'class-transformer';
import { StandardSchemaV1 } from '@standard-schema/spec';

const mapErrors = (errors: ValidationError[], parentPath: ReadonlyArray<PropertyKey> = []): StandardSchemaV1.Issue[] => {
  return errors.flatMap((error) => {
    const currentPath = [...parentPath, error.property];

    const currentIssue: StandardSchemaV1.Issue = {
      path: currentPath,
      message: Object.values(error.constraints ?? {})[0] || 'Validation error',
    };

    let childIssues: StandardSchemaV1.Issue[] = [];
    if (error.children && error.children.length > 0) {
      childIssues = mapErrors(error.children, currentPath);
    }

    return [currentIssue, ...childIssues];
  });
};

export function createStandardSchema<T extends new (...args: any[]) => any>(
  DtoClass: T,
  vendorName: string = 'class-validator/class-transformer',
  options?: {
    validator?: ValidatorOptions
    transformer?: ClassTransformOptions
  }
): StandardSchemaV1<any, InstanceType<T>> {
  if (!options) options = {};
  options.validator = options?.validator ?? {};
  options.validator.whitelist = options?.validator?.whitelist ?? true;
  options.validator.forbidNonWhitelisted = options?.validator?.forbidNonWhitelisted ?? true;
  options.validator.skipMissingProperties =
    options?.validator?.skipMissingProperties ?? true;

  return {
    '~standard': {
      version: 1,
      vendor: vendorName,
      types: {
        input: 'any' as any,
        output: {} as InstanceType<T>
      },
      async validate(data: unknown) {
        const instance = plainToInstance(DtoClass, data, options.transformer);

        const errors = await validate(instance, options.validator);

        if (errors.length > 0) {
          const issues = mapErrors(errors);

          return { issues };
        }

        return instance;
      },
    },
  };
}
