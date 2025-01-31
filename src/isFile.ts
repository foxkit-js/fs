import { stat } from "fs/promises";

/**
 * Checks if there is a file at a given path
 * @param filePath Path pointing to the file
 * @returns boolean
 */
export async function isFile(filePath: string) {
  try {
    const fileStat = await stat(filePath);
    return fileStat.isFile();
  } catch {
    return false;
  }
}
