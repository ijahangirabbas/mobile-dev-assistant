/**
 * Represents one searchable chunk of lesson content.
 *
 * Contains:
 *
 * id            – unique deterministic identifier  e.g. "chunk-0001"
 *
 * metadata      – course / module / lesson identifiers
 *
 * text          – merged subtitle text for this window
 *
 * timeline      – human-readable range  "00:02:00 - 00:02:15"
 *
 * timestamps    – startMs / endMs / durationMs (raw numbers)
 *
 * subtitleCount – how many SubtitleEntry objects were merged
 */

export class Chunk {
  /**
   * @param {object} params
   * @param {string}       params.id
   * @param {ChunkMeta}    params.meta
   * @param {string}       params.text
   * @param {string}       params.timeline
   * @param {ChunkTimings} params.timings
   * @param {number}       params.subtitleCount
   */
  constructor({ id, meta, text, timeline, timings, subtitleCount }) {
    this.id = id;
    this.meta = Object.freeze({ ...meta });
    this.text = text;
    this.timeline = timeline;
    this.timings = Object.freeze({ ...timings });
    this.subtitleCount = subtitleCount;

    Object.freeze(this);
  }
}

/**
 * @typedef {object} ChunkMeta
 * @property {string}      courseName
 * @property {number|null} moduleNumber
 * @property {string}      moduleFolderName
 * @property {number|null} lessonNumber
 * @property {string}      lessonTitle
 * @property {string}      lessonSlug
 */

/**
 * @typedef {object} ChunkTimings
 * @property {number} startMs
 * @property {number} endMs
 * @property {number} durationMs
 */
