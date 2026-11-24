export function getCartoTileUrl(apiKey: string): string | null {
  const key = apiKey.trim();

  if (!key) return null;

  return (
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png' +
    `?key=${encodeURIComponent(key)}`
  );
}
