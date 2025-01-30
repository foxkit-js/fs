import * as fs from "fs/promises";

/**
 * Function that parses data `T` from string to any type. May be async.
 */
export type FileParser<T> = (content: string) => T | Promise<T>;

/**
 * Result of a successful file read with parsed data
 */
interface FileReadResultSuccess<T> {
  /**
   * Data from the file (parsed if a `FileParser` was provided)
   */
  data: T;
  /**
   * No error occured
   */
  error?: undefined;
  success: true;
}

/**
 * Result of an unsuccessful file read with occured error
 */
interface FileReadResultError {
  /**
   * No data was returned due to an error
   */
  data?: undefined;
  /**
   * Error that occured when attempting to read the file
   */
  error: unknown;
  success: false;
}

/**
 * Object describing the result of a file read. Always contains `success` property.
 * If successful the read/parsed data is available in the `data` property,
 * otherwise the error that occurred can be found in the `error` property.
 */
export type FileReadResult<T = string> = Promise<
  FileReadResultSuccess<T> | FileReadResultError
>;

/**
 * Asynchronously reads a file and optionally applies Parser
 * @param path Path pointing to the file
 * @param parser Function that transforms file content from string to any data type
 * @returns FileReadResult
 */
export async function readFile<T>(
  path: string,
  parser: (content: string) => T | Promise<T>
): FileReadResult<T>;
export async function readFile(
  path: string,
  parser?: undefined
): FileReadResult;
export async function readFile<T = string>(
  path: string,
  parser?: (content: string) => T | Promise<T>
): FileReadResult<T> {
  try {
    const content = await fs.readFile(path, "utf-8");
    if (!parser) return { data: content as T, success: true };
    const data = await parser(content);
    return { data, success: true };
  } catch (error: unknown) {
    return { error, success: false };
  }
}
