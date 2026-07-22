/**
 * Represents one subtitle cue parsed from an SRT file.
 *
 * Fields:
 *
 * id          – sequential cue index from the SRT file (1-based)
 *
 * startMs     – start time in milliseconds
 *
 * endMs       – end time in milliseconds
 *
 * durationMs  – endMs - startMs
 *
 * startFmt    – formatted start  "HH:MM:SS"
 *
 * endFmt      – formatted end    "HH:MM:SS"
 *
 * text        – cleaned cue text (no HTML, no extra whitespace)
 */

export class SubtitleEntry {
  /**
   * @param {object} params
   * @param {number} params.id
   * @param {number} params.startMs
   * @param {number} params.endMs
   * @param {string} params.startFmt
   * @param {string} params.endFmt
   * @param {string} params.text
   */
  constructor({ id, startMs, endMs, startFmt, endFmt, text }) {
    this.id = id;
    this.startMs = startMs;
    this.endMs = endMs;
    this.durationMs = endMs - startMs;
    this.startFmt = startFmt;
    this.endFmt = endFmt;
    this.text = text;

    Object.freeze(this);
  }
}
