export function readCommentPreference(key, fallback, allowed) {
  try {
    const value = JSON.parse(
      localStorage.getItem("tesisori.commentPreferences") ||
        localStorage.getItem("tassiori.commentPreferences") ||
        "{}",
    )[key];
    return allowed.includes(value) ? value : fallback;
  } catch {
    return fallback;
  }
}
export function saveCommentPreferences(pageSize, sortBy) {
  try {
    localStorage.setItem(
      "tesisori.commentPreferences",
      JSON.stringify({ pageSize, sortBy }),
    );
  } catch {
    /* Preferences still apply for this session if browser storage is unavailable. */
  }
}
