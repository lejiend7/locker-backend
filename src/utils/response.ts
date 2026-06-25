export type ApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T[];
  errors: string[];
};

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

    if (Array.isArray(options.data)) {
      return options.data;
    }

    return [options.data];
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
