import { ZodError } from "zod";

export function getZodMessage(error: unknown, fallback: string) {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? fallback;
  }

  if (error && typeof error === "object") {
    const axiosLikeError = error as {
      response?: {
        data?: {
          message?: unknown;
        };
      };
      message?: unknown;
    };
    const backendMessage = axiosLikeError.response?.data?.message;

    if (typeof backendMessage === "string" && backendMessage.trim().length > 0) {
      return backendMessage;
    }

    if (
      typeof axiosLikeError.message === "string"
      && axiosLikeError.message.trim().length > 0
    ) {
      return axiosLikeError.message;
    }
  }

  return fallback;
}
