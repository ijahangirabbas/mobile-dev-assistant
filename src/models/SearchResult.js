/**
 * SearchResult model.
 *
 * The shared output type of the retrieval layer.
 * Used by ranking, context building, validation, and formatting.
 *
 * Neither Qdrant SDK types nor raw JSON leak past this model.
 */

export class SearchResult {
  /**
   * @param {object}       params
   * @param {string}       params.id          chunk ID
   * @param {number}       params.score       similarity score (0-1)
   * @param {string}       params.text        subtitle text
   * @param {string}       params.timeline    "00:02:00 - 00:02:15"
   * @param {SearchMeta}   params.meta
   */
  constructor({ id, score, text, timeline, meta }) {
    this.id = id;
    this.score = score;
    this.text = text;
    this.timeline = timeline;
    this.meta = Object.freeze({ ...meta });
    Object.freeze(this);
  }
}

/**
 * @typedef {object} SearchMeta
 * @property {string}      courseName
 * @property {number|null} moduleNumber
 * @property {string}      moduleFolderName
 * @property {number|null} lessonNumber
 * @property {string}      lessonTitle
 * @property {string}      lessonSlug
 * @property {number}      startMs
 * @property {number}      endMs
 * @property {number}      durationMs
 * @property {number}      subtitleCount
 */
