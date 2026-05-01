type AuthErrorPayload = string | {
  message?: unknown;
  detail?: unknown;
};

type AuthApiError = {
  response?: {
    data?: AuthErrorPayload;
  };
};

export function getAuthErrorMessage(error: unknown): string | null {
  const data = (error as AuthApiError).response?.data;

  if (typeof data === 'string') {
    return data;
  }

  if (data && typeof data === 'object') {
    if (typeof data.message === 'string') {
      return data.message;
    }

    if (typeof data.detail === 'string') {
      return data.detail;
    }
  }

  return null;
}
