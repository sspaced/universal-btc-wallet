import { DomainError } from '../errors/DomainError';

export type Result<T, E = DomainError> =
  | { success: true; value: T }
  | { success: false; error: E };

export class ResultUtils {
  static success<T>(value: T): Result<T> {
    return { success: true, value };
  }

  static failure<T, E = DomainError>(error: E): Result<T, E> {
    return { success: false, error };
  }

  static isSuccess<T, E>(result: Result<T, E>): result is { success: true; value: T } {
    return result.success;
  }

  static isFailure<T, E>(result: Result<T, E>): result is { success: false; error: E } {
    return !result.success;
  }

  static map<T, U, E>(
    result: Result<T, E>,
    mapFn: (value: T) => U
  ): Result<U, E> {
    return result.success
      ? ResultUtils.success(mapFn(result.value))
      : result;
  }

  static flatMap<T, U, E>(
    result: Result<T, E>,
    mapFn: (value: T) => Result<U, E>
  ): Result<U, E> {
    return result.success
      ? mapFn(result.value)
      : result;
  }

  static async asyncMap<T, U, E>(
    result: Result<T, E>,
    mapFn: (value: T) => Promise<U>
  ): Promise<Result<U, E>> {
    if (result.success) {
      try {
        const value = await mapFn(result.value);
        return ResultUtils.success(value);
      } catch (error) {
        return ResultUtils.failure(error as E);
      }
    }
    return result;
  }
}