export function formatElapsed(ms: number): string {
  const safe = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}
