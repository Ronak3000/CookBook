import axios from 'axios';

/** Return display text only; an Error object cannot be rendered by React. */
export function requestErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message: unknown = error.response?.data?.message;
    return typeof message === 'string' && message.trim() ? message : fallback;
  }
  return fallback;
}
