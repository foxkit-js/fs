import * as fs from "fs/promises";
import { dirname } from "path";

export type FileSerializer<T> = (data: T) => string | Promise<string>;
export type FileWriteResult = Promise<
  { error?: undefined; success: true } | { error: unknown; success: false }
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
