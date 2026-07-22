/**
 * Small filesystem helpers.
 *
 * Centralizes all fs calls so the rest of the codebase
 * never imports "fs" directly.
 *
 * Operations:
 *
 * exists(path)              – check if a path exists
 *
 * readText(path)            – read a file as UTF-8 string
 *
 * writeText(path, content)  – write a UTF-8 string to a file
 *
 * readDir(path)             – list directory entries (with types)
 *
 * stat(path)                – get file/directory stats
 *
 * isDirectory(entry)        – true if a dirent is a directory
 *
 * isFile(entry)             – true if a dirent is a regular file
 */

import { promises as fs } from "fs";

/**
 * @param {string} filePath
 * @returns {Promise<boolean>}
 */
export async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {string} filePath
 * @returns {Promise<string>}
 */
export async function readText(filePath) {
  return fs.readFile(filePath, "utf-8");
}

/**
 * @param {string} filePath
 * @param {string} content
 * @returns {Promise<void>}
 */
export async function writeText(filePath, content) {
  return fs.writeFile(filePath, content, "utf-8");
}

/**
 * @param {string} dirPath
 * @returns {Promise<import('fs').Dirent[]>}
 */
export async function readDir(dirPath) {
  return fs.readdir(dirPath, { withFileTypes: true });
}

/**
 * @param {string} filePath
 * @returns {Promise<import('fs').Stats>}
 */
export async function stat(filePath) {
  return fs.stat(filePath);
}

/**
 * @param {import('fs').Dirent} entry
 * @returns {boolean}
 */
export function isDirectory(entry) {
  return entry.isDirectory();
}

/**
 * @param {import('fs').Dirent} entry
 * @returns {boolean}
 */
export function isFile(entry) {
  return entry.isFile();
}
