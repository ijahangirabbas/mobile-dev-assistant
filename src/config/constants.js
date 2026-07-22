/**
 * Shared constants.
 *
 * Example:
 * - Supported extensions
 * - Default chunk size
 * - Timestamp regex
 * - Parser regex
 *
 * No functions.
 */

/** File extensions the scanner will pick up */
export const SUPPORTED_EXTENSIONS = Object.freeze([".srt"]);

// ---------------------------------------------------------------------------
// SRT parsing
// ---------------------------------------------------------------------------

/**
 * Matches an SRT timestamp line:
 *   00:01:25,500 --> 00:01:28,000
 *
 * Groups:
 *   1 – start timestamp string
 *   2 – end timestamp string
 */
export const SRT_TIMESTAMP_LINE_REGEX =
  /^(\d{2}:\d{2}:\d{2}[,.:]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.:]\d{3})/;

/**
 * Matches a single SRT timestamp component:
 *   HH:MM:SS,mmm
 *
 * Groups:
 *   1 – hours
 *   2 – minutes
 *   3 – seconds
 *   4 – milliseconds
 */
export const SRT_TIMESTAMP_REGEX =
  /^(\d{2}):(\d{2}):(\d{2})[,.](\d{3})$/;

/**
 * Formatted timeline display separator.
 * e.g.  00:02:00 - 00:02:15
 */
export const TIMELINE_SEPARATOR = " - ";

// ---------------------------------------------------------------------------
// HTML / text cleaning
// ---------------------------------------------------------------------------

/** Matches any HTML tag */
export const HTML_TAG_REGEX = /<[^>]+>/g;

/** Matches two or more consecutive whitespace characters */
export const MULTI_SPACE_REGEX = /\s{2,}/g;

/** Matches leading/trailing blank lines in a block of text */
export const BLANK_LINE_REGEX = /^\s*[\r\n]/gm;

// ---------------------------------------------------------------------------
// Folder name extraction
// ---------------------------------------------------------------------------

/**
 * Extracts the leading numeric portion from a folder name.
 * e.g. "02_react-native-vs-expo" → "02"
 */
export const FOLDER_NUMBER_REGEX = /^\d+/;

/**
 * Strips the leading numeric prefix (and optional separator) from a folder name.
 * e.g. "02_react-native-vs-expo_epm" → "react-native-vs-expo_epm"
 */
export const FOLDER_PREFIX_STRIP_REGEX = /^\d+[_\-\s]*/;

// ---------------------------------------------------------------------------
// ID generation
// ---------------------------------------------------------------------------

/** Zero-pad width for sequential IDs */
export const ID_PAD_WIDTH = 4;

// ---------------------------------------------------------------------------
// Chunking
// ---------------------------------------------------------------------------

/** Default chunk window in seconds (overridden by config) */
export const DEFAULT_CHUNK_WINDOW_SECONDS = 15;
