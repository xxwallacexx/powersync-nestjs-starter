import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  ValidateIf,
  ValidationOptions,
} from 'class-validator';

export interface OptionalOptions extends ValidationOptions {
  nullable?: boolean;
  emptyToNull?: boolean;
}

export function Optional({
  nullable,
  emptyToNull,
  ...validationOptions
}: OptionalOptions = {}) {
  const decorators: PropertyDecorator[] = [];

  if (nullable === true) {
    decorators.push(IsOptional(validationOptions));
  } else {
    decorators.push(
      ValidateIf((object: any, v: any) => v !== undefined, validationOptions),
    );
  }

  if (emptyToNull) {
    decorators.push(Transform(({ value }) => (value === '' ? null : value)));
  }

  return applyDecorators(...decorators);
}

type BooleanOptions = { optional?: boolean };
export const ValidateBoolean = (options?: BooleanOptions) => {
  const { optional } = { optional: false, ...options };
  const decorators = [
    IsBoolean(),
    Transform(({ value }) => {
      if (value == 'true') {
        return true;
      } else if (value == 'false') {
        return false;
      }
      return value;
    }),
  ];

  if (optional) {
    decorators.push(Optional());
  }

  return applyDecorators(...decorators);
};
