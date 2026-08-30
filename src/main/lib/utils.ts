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
