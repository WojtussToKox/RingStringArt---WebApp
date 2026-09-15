import { StringArtEngine, type StringArtParams } from '../algorithm/StringArtEngine';

self.onmessage = (e: MessageEvent<{ imageData: Uint8Array; params: StringArtParams }>) => {
  try {
    const { imageData, params } = e.data;
    
    const engine = new StringArtEngine(imageData, params);
    
    const sequence = engine.generate();
    
    self.postMessage({ type: 'success', sequence });
  } catch (error) {
    self.postMessage({ type: 'error', error: String(error) });
  }
};