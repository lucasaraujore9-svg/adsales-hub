/**
 * Extract a JSON object from a string response. Claude sometimes wraps its
 * output in a ```json ... ``` fence or adds a leading sentence; this helper
 * peels the fence off and returns the first parseable JSON blob it finds.
 */
export function extractJson(raw: string): unknown {
  const trimmed = raw.trim();

  const fenceMatch =
    trimmed.match(/```json\s*([\s\S]*?)```/i) ??
    trimmed.match(/```\s*([\s\S]*?)```/);

  const candidate = fenceMatch ? fenceMatch[1].trim() : trimmed;

  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1));
    }
    const arrStart = candidate.indexOf("[");
    const arrEnd = candidate.lastIndexOf("]");
    if (arrStart >= 0 && arrEnd > arrStart) {
      return JSON.parse(candidate.slice(arrStart, arrEnd + 1));
    }
    throw new Error(
      `Unable to extract JSON from response: ${raw.slice(0, 200)}...`,
    );
  }
}
