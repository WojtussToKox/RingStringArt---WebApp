import { useState, useRef } from 'react';
import StringArtWorker from './core/workers/stringArtWorker?worker';
import { type StringArtParams } from './core/algorithm/StringArtEngine';

export default function App() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<number[] | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setResult(null);

    workerRef.current = new StringArtWorker();

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
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Test Web Workera</h1>

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-md disabled:opacity-50 transition-all"
      >
        {isGenerating ? 'Generowanie w tle...' : 'Start Testu Algorytmu'}
      </button>

      {isGenerating && (
        <div className="mt-8 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mb-4 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">
            UI jest responsywne! Spróbuj zaznaczyć ten tekst.
          </p>
        </div>
      )}

      {result && (
        <div className="mt-8 p-4 bg-white rounded-lg shadow border border-green-200 text-center">
          <p className="text-green-600 font-bold mb-2">✅ Sukces!</p>
          <p className="text-gray-700">Wygenerowano tablicę o długości: {result.length}</p>
        </div>
      )}
    </div>
  );
}