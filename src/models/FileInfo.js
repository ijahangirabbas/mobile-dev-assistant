/**
 * Represents one subtitle file.
 *
 * Contains:
 *
 * raw metadata     – exact folder / file names from disk
 *
 * normalized metadata – parsed course / module / lesson values
 *
 * file metadata    – extension, size
 *
 * Immutable.
 */

export class FileInfo {
  /**
   * @param {object} params
   * @param {RawMeta}        params.raw
   * @param {NormalizedMeta} params.normalized
   * @param {FileMeta}       params.file
   */
  constructor({ raw, normalized, file }) {
    /** @type {RawMeta} */
    this.raw = Object.freeze({ ...raw });

    /** @type {NormalizedMeta} */
    this.normalized = Object.freeze({ ...normalized });

    /** @type {FileMeta} */
    this.file = Object.freeze({ ...file });

    Object.freeze(this);
  }
}

/**
 * @typedef {object} RawMeta
 * @property {string} absolutePath
 * @property {string} relativePath
 * @property {string} moduleFolder
 * @property {string} lessonFolder
 * @property {string} fileName
 */

/**
 * @typedef {object} NormalizedMeta
 * @property {string}      courseName
 * @property {number|null} moduleNumber
 * @property {string}      moduleFolderName
 * @property {number|null} lessonNumber
 * @property {string}      lessonTitle
 * @property {string}      lessonSlug
 */

/**
 * @typedef {object} FileMeta
 * @property {string} extension
 * @property {number} size        bytes
 */
