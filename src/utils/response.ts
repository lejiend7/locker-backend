export type ApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | T[];
  errors: string[];
};

function toCamelCase(key: string): string {
  return key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function camelCaseResponseData(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(camelCaseResponseData);
  }

  if (value instanceof Date || value === null || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => [
      toCamelCase(key),
      camelCaseResponseData(nestedValue),
    ])
  );
}

export function buildApiResponse<T>(options: {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T | T[] | null;
  errors?: string | string[] | null;
}): ApiResponse<T> {
  const normalizedData = (() => {
    if (options.data == null) {
      return [] as T[];
    }

    return camelCaseResponseData(options.data) as T | T[];
  })();

  const normalizedErrors = (() => {
    if (!options.errors) {
      return [];
    }

    if (Array.isArray(options.errors)) {
      return options.errors;
    }

    return [options.errors];
  })();

  return {
    success: options.success,
    statusCode: options.statusCode,
    message: options.message,
    data: normalizedData,
    errors: normalizedErrors,
  };
}
