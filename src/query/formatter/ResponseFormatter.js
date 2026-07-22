/**
 * ResponseFormatter - Formats the final API / UI response payload.
 */

export class ResponseFormatter {
  /**
   * @param {import('../QueryContext.js').QueryContext} ctx
   * @returns {object}
   */
  format(ctx) {
    return {
      query: ctx.rawQuery,
      answer: ctx.finalAnswer || ctx.rawAnswer,
      confidence: ctx.confidence,
      intent: ctx.intent,
      hasLlm: Boolean(ctx.rawAnswer && ctx.rawAnswer.length > 0),
      sources: ctx.sources.map((s) => ({
        moduleFolderName: s.moduleFolderName,
        lessonTitle: s.lessonTitle,
        fileName: s.fileName || s.lessonTitle || s.lessonSlug,
        lessonSlug: s.lessonSlug,
        timeline: s.timeline,
        startTime: s.startTime,
        endTime: s.endTime,
        text: s.text,
        relevanceScore: Number(s.score.toFixed(3)),
      })),
      timings: {
        totalMs: ctx.elapsedMs(),
        stages: ctx.timings,
      },
      retries: ctx.retryCount,
    };
  }
}
