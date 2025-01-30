import * as fs from "fs/promises";

/**
 * Function that parses data from string to any type. May be async.
 */
export type FileParser<T> = (content: string) => T | Promise<T>;
/**
 * Object describing the result of a file read. Always contains `success` property.
 * If successful the read/parsed data is available in the `data` property,
 * otherwise the error that occurred can be found in the `error` property.
 */
// TODO: split into interfaces, add JSDocs to properties of those?
export type FileReadResult<T = string> = Promise<
  | { data: T; error?: undefined; success: true }
  | { data?: undefined; error: unknown; success: false }
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
