/**
 * Represents one lesson.
 *
 * Contains:
 *
 * metadata  – FileInfo (course / module / lesson identifiers)
 *
 * entries   – SubtitleEntry[] (all parsed subtitle cues)
 *
 * stats     – derived statistics (entry count, total duration)
 */

export class Lesson {
  /**
   * @param {object}          params
   * @param {import('./FileInfo.js').FileInfo}             params.fileInfo
   * @param {import('./SubtitleEntry.js').SubtitleEntry[]} params.entries
   */
  constructor({ fileInfo, entries }) {
    /** @type {import('./FileInfo.js').FileInfo} */
    this.fileInfo = fileInfo;

    /** @type {import('./SubtitleEntry.js').SubtitleEntry[]} */
    this.entries = entries;

    /** @type {LessonStats} */
    this.stats = Object.freeze(this._computeStats(entries));

    Object.freeze(this);
  }

  /**
   * @param {import('./SubtitleEntry.js').SubtitleEntry[]} entries
   * @returns {LessonStats}
   */
  _computeStats(entries) {
    if (entries.length === 0) {
      return { entryCount: 0, totalDurationMs: 0 };
    }

    const first = entries[0];
    const last = entries[entries.length - 1];

    return {
      entryCount: entries.length,
      totalDurationMs: last.endMs - first.startMs,
    };
  }
}

/**
 * @typedef {object} LessonStats
 * @property {number} entryCount      total subtitle cues
 * @property {number} totalDurationMs lesson duration in ms
 */
