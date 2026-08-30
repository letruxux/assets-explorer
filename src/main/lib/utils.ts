export function makeMs({
  days,
  hours,
  minutes,
  seconds
}: {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}): number {
  return (
    (days ?? 0) * 1000 * 60 * 60 * 24 +
    (hours ?? 0) * 1000 * 60 * 60 +
    (minutes ?? 0) * 1000 * 60 +
    (seconds ?? 0) * 1000
  );
}

export const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36";
