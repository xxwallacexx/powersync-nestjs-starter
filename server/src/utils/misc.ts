export class AppStartupError extends Error {}
export const isStartUpError = (error: unknown): error is AppStartupError =>
  error instanceof AppStartupError;

export const getKeyByValue = (
  object: Record<string, unknown>,
  value: unknown,
) => Object.keys(object).find((key) => object[key] === value);

export const routeToErrorMessage = (methodName: string) =>
  'Failed to ' +
  methodName.replaceAll(/[A-Z]+/g, (letter) => ` ${letter.toLowerCase()}`);
