/**
 * Walks the course directory.
 *
 * Responsibilities:
 * - Scan folders recursively
 * - Discover .srt files
 * - Ignore everything else
 * - Build FileInfo for each discovered file
 *
 * Does NOT:
 * - Read subtitle content
 * - Parse SRT
 * - Chunk
 * - Embed
 */

import path from "path";
import { FileInfo } from "../models/FileInfo.js";
import { SUPPORTED_EXTENSIONS } from "../config/constants.js";
import { readDir, stat, isDirectory, isFile } from "../utils/FileSystem.js";
import {
  extractNumber,
  extractTitle,
  createSlug,
} from "./MetadataNormalizer.js";

export class CourseScanner {
  /**
   * @param {object} [options]
   * @param {string[]} [options.extensions]  file extensions to accept
   */
  constructor({ extensions = SUPPORTED_EXTENSIONS } = {}) {
    this.extensions = extensions;
  }

  /**
   * Recursively scan rootPath and return a FileInfo for every .srt file found.
   *
   * @param {string} rootPath
   * @returns {Promise<FileInfo[]>}
   */
  async scan(rootPath) {
    const absoluteRoot = path.resolve(rootPath);
    const results = [];
    await this._walk(absoluteRoot, absoluteRoot, results);
    return results;
  }

  /**
   * Recursive directory walker.
   *
   * @param {string}     rootPath
   * @param {string}     currentPath
   * @param {FileInfo[]} results
   */
  async _walk(rootPath, currentPath, results) {
    const entries = await readDir(currentPath);

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (isDirectory(entry)) {
        await this._walk(rootPath, fullPath, results);
        continue;
      }

      if (!isFile(entry)) continue;

      const ext = path.extname(entry.name).toLowerCase();
      if (!this.extensions.includes(ext)) continue;

      const fileInfo = await this._buildFileInfo(rootPath, fullPath, ext);
      results.push(fileInfo);
    }
  }

  /**
   * Build a FileInfo from raw path components.
   *
   * Expected directory layout:
   *   <rootPath>/
   *     <moduleFolder>/
   *       <lessonFolder>/
   *         <fileName>.srt
   *
   * @param {string} rootPath
   * @param {string} fullPath
   * @param {string} extension
   * @returns {Promise<FileInfo>}
   */
  async _buildFileInfo(rootPath, fullPath, extension) {
    const relativePath = path.relative(rootPath, fullPath);
    const parts = relativePath.split(path.sep);

    const moduleFolder = parts[0] ?? "";
    const lessonFolder = parts[1] ?? "";
    const fileName = parts[2] ?? path.basename(fullPath);

    const fileStat = await stat(fullPath);

    return new FileInfo({
      raw: {
        absolutePath: fullPath,
        relativePath,
        moduleFolder,
        lessonFolder,
        fileName,
      },
      normalized: {
        courseName: path.basename(rootPath),
        moduleNumber: extractNumber(moduleFolder),
        moduleFolderName: moduleFolder,
        lessonNumber: extractNumber(lessonFolder),
        lessonTitle: extractTitle(lessonFolder),
        lessonSlug: createSlug(lessonFolder),
      },
      file: {
        extension,
        size: fileStat.size,
      },
    });
  }
}
