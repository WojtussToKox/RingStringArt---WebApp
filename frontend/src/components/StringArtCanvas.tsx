import { useEffect, useRef } from 'react';
import { getNailCoordinates } from '../utils/geometry';

interface StringArtCanvasProps {
  sequence: number[];
  nailCount: number;
  width?: number;
  height?: number;
}

export default function StringArtCanvas({
  sequence,
  nailCount,
  width = 500,
  height = 500,
}: StringArtCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || sequence.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nails = getNailCoordinates(nailCount, width, height);

    ctx.clearRect(0, 0, width, height);

    const radius = Math.min(width, height) / 2 - 1;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 0.5;

    
    const startNail = nails[sequence[0]];
    ctx.moveTo(startNail.x, startNail.y);


    for (let i = 1; i < sequence.length; i++) {
      const nextNail = nails[sequence[i]];
      ctx.lineTo(nextNail.x, nextNail.y);
    }

    ctx.stroke();
  }, [sequence, nailCount, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="bg-white rounded-full shadow-lg border border-gray-100 max-w-full h-auto"
    />
  );
}