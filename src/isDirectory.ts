import { stat } from "fs/promises";

/**
 * Checks if there is a directory at a given path
 * @param dirPath Path pointing to the directory
 * @returns boolean
 */
export async function isDirectory(dirPath: string) {
  try {
    const dirStat = await stat(dirPath);
    return dirStat.isDirectory();
  } catch {
    return false;
  }
}
