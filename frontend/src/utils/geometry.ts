export function getNailCoordinates(nailCount: number, width: number, height: number) {
  const radius = Math.min(width, height) / 2 - 1;
  const centerX = width / 2;
  const centerY = height / 2;
  const nails: { x: number; y: number }[] = [];

  for (let i = 0; i < nailCount; i++) {
    const angle = (i * 2 * Math.PI) / nailCount;
    nails.push({
      x: Math.round(centerX + radius * Math.cos(angle)),
      y: Math.round(centerY + radius * Math.sin(angle)),
    });
  }

  return nails;
}