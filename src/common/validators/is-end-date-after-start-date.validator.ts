import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsEndDateAfterStartDate(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isEndDateAfterStartDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: string, args: ValidationArguments) {
          const relatedPropertyName = args.constraints[0] as string;
          const startDate = (args.object as Record<string, string>)[
            relatedPropertyName
          ];

          return new Date(value).getTime() > new Date(startDate).getTime();
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} doit être après la date de début.`;
        },
      },
    });
  };
}
