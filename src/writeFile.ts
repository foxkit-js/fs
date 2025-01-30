import * as fs from "fs/promises";
import { dirname } from "path";

/**
 * Function that transform data `T` to string. May be async.
 */
export type FileSerializer<T> = (data: T) => string | Promise<string>;

/**
 * Result of a successful file write
 */
interface FileWriteResultSuccess {
  /**
   * No error occured
   */
  error?: undefined;
  success: true;
}

/**
 * Result of an unsuccessful file write with occurred error
 */
interface FileWriteResultError {
  /**
   * Error that occured when attempting to write the file
   */
  error: unknown;
  success: false;
}

export type FileWriteResult = Promise<
  FileWriteResultSuccess | FileWriteResultError
>;

/**
 * Asynchronously writes any data to file. Non-string data must be supplied with
 * a serialiser function. Directories are created as needed.
 * @param path Path pointing to the file
 * @param data Data to write to the file
 * @param serialiser Function that transforms passed data to string
 * @returns FileWriteResult
 */
export async function writeFile<T>(
  path: string,
  data: T,
  serialiser: FileSerializer<T>
): FileWriteResult;
export async function writeFile(
  path: string,
  data: string,
  serialiser?: undefined
): FileWriteResult;
export async function writeFile<T>(
  path: string,
  data: T,
  serialiser?: T extends string ? undefined : FileSerializer<T>
): FileWriteResult {
  try {
    const content = serialiser ? await serialiser(data) : (data as string);
    await fs.mkdir(dirname(path), { recursive: true });
    await fs.writeFile(path, content, "utf-8");
    return { success: true };
  } catch (error: unknown) {
    return { error, success: false };
  }
}
