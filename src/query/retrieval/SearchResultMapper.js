/**
 * Maps raw Qdrant search results into SearchResult domain objects.
 *
 * The rest of the query pipeline never touches Qdrant's raw format.
 * If the Qdrant SDK changes, only this file needs updating.
 */

import { SearchResult } from "../../models/SearchResult.js";

/**
 * @param {object[]} rawResults  from QdrantVectorStore.search()
 * @returns {SearchResult[]}
 */
export function mapSearchResults(rawResults) {
  return rawResults.map((r) => {
    const p = r.payload ?? {};

    return new SearchResult({
      id:       p.chunkId ?? String(r.id),
      score:    r.score,
      text:     p.text ?? "",
      timeline: p.timeline ?? "",
      meta: {
        courseName:       p.courseName ?? "",
        moduleNumber:     p.moduleNumber ?? null,
        moduleFolderName: p.moduleFolderName ?? "",
        lessonNumber:     p.lessonNumber ?? null,
        lessonTitle:      p.lessonTitle ?? "",
        lessonSlug:       p.lessonSlug ?? "",
        startMs:          p.startMs ?? 0,
        endMs:            p.endMs ?? 0,
        durationMs:       p.durationMs ?? 0,
        subtitleCount:    p.subtitleCount ?? 0,
      },
    });
  });
}
