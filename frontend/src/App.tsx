import { useState, useRef } from 'react';
import StringArtWorker from './core/workers/stringArtWorker?worker';
import { type StringArtParams } from './core/algorithm/StringArtEngine';
import StringArtCanvas from './components/StringArtCanvas'; // ZMIANA: import

export default function App() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<number[] | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setResult(null);

    workerRef.current = new StringArtWorker();

    // Pamiętasz nasz test z czarnym tłem?
    const testWidth = 500;
    const testHeight = 500;
    const dummyData = new Uint8Array(testWidth * testHeight).fill(0);
    const params: StringArtParams = {
      width: testWidth,
      height: testHeight,
      nailCount: 288,
      lineCount: 3000,
    };

    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'success') {
        setResult(e.data.sequence);
      } else {
        console.error("Błąd z Workera:", e.data.error);
      }
      setIsGenerating(false);
      workerRef.current?.terminate();
    };

    workerRef.current.postMessage({ imageData: dummyData, params });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Test Silnika & Canvasa</h1>

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-md disabled:opacity-50 transition-all mb-8"
      >
        {isGenerating ? 'Generowanie w tle...' : 'Start Testu Algorytmu'}
      </button>

      {/* ZMIANA: Renderujemy nasz komponent jeśli mamy wynik */}
      {result && (
        <div className="flex flex-col items-center">
          <StringArtCanvas sequence={result} nailCount={288} />
          <p className="mt-4 text-gray-500 font-mono text-sm">
            Wygenerowano linii: {result.length - 1}
          </p>
        </div>
      )}
    </div>
  );
}