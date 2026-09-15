export interface StringArtParams {
  width: number;
  height: number;
  nailCount: number;
  lineCount: number;
  lineWeight?: number;
}

export class StringArtEngine {
  private width: number;
  private height: number;
  private nailCount: number;
  private lineCount: number;
  private lineWeight: number;

  // Mapa szarości obrazu: 0 = czarny, 255 = biały
  private imgData: Uint8Array;
  
  // Pozycje gwoździ na okręgu
  private nails: { x: number; y: number }[] = [];
  
  // Cache wszystkich linii: lineCache[i][j] = tablica indeksów pikseli
  private lineCache: Uint32Array[][] = [];

  constructor(rgbaData: Uint8ClampedArray | Uint8Array, params: StringArtParams) {
    this.width = params.width;
    this.height = params.height;
    this.nailCount = params.nailCount;
    this.lineCount = params.lineCount;
    this.lineWeight = params.lineWeight || 20;

   
    this.imgData = new Uint8Array(this.width * this.height);
    
    const isRgba = rgbaData.length === this.width * this.height * 4;
    
    for (let i = 0; i < this.imgData.length; i++) {
      if (isRgba) {
        const r = rgbaData[i * 4];
        const g = rgbaData[i * 4 + 1];
        const b = rgbaData[i * 4 + 2];
    
        this.imgData[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      } else {
        
        this.imgData[i] = rgbaData[i];
      }
    }

    this.calculateNails();
    this.precalculateLines();
  }

  // Obliczanie współrzędnych gwoździ na okręgu wpisanym w kwadrat
  private calculateNails() {
    const radius = Math.min(this.width, this.height) / 2 - 1;
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    for (let i = 0; i < this.nailCount; i++) {
      const angle = (i * 2 * Math.PI) / this.nailCount;
      this.nails.push({
        x: Math.round(centerX + radius * Math.cos(angle)),
        y: Math.round(centerY + radius * Math.sin(angle)),
      });
    }
  }


  private precalculateLines() {
    for (let i = 0; i < this.nailCount; i++) {
      this.lineCache[i] = [];
      for (let j = 0; j < this.nailCount; j++) {
        if (i >= j) continue;

        const path = this.getBresenhamPath(this.nails[i], this.nails[j]);
        this.lineCache[i][j] = path;
      }
    }
  }

  
  private getBresenhamPath(p1: { x: number; y: number }, p2: { x: number; y: number }): Uint32Array {
    let x0 = p1.x;
    let y0 = p1.y;
    const x1 = p2.x;
    const y1 = p2.y;

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    
    const indices: number[] = [];

    while (true) {
      if (x0 >= 0 && x0 < this.width && y0 >= 0 && y0 < this.height) {
        indices.push(y0 * this.width + x0);
      }
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }

    return new Uint32Array(indices);
  }

  
  private getLinePath(nailA: number, nailB: number): Uint32Array {
    if (nailA < nailB) return this.lineCache[nailA][nailB];
    return this.lineCache[nailB][nailA];
  }

  // Główna pętla algorytmu zachłannego
  public generate(): number[] {
    const sequence: number[] = [0];
    let currentNail = 0;

    for (let step = 0; step < this.lineCount; step++) {
      let bestScore = -1;
      let bestNextNail = -1;

      
      for (let nextNail = 0; nextNail < this.nailCount; nextNail++) {
        
        let distance = Math.abs(currentNail - nextNail);
        distance = Math.min(distance, this.nailCount - distance);
        
        const minDistance = Math.floor(this.nailCount * 0.07); 
        
        if (distance < minDistance) {
          continue;
        }

        const path = this.getLinePath(currentNail, nextNail);
        
        let score = 0;
        for (let i = 0; i < path.length; i++) {
          score += (255 - this.imgData[path[i]]);
        }
        
        const avgScore = path.length > 0 ? score / path.length : 0;

        if (avgScore > bestScore) {
          bestScore = avgScore;
          bestNextNail = nextNail;
        }
      }

      if (bestNextNail === -1) break;

      sequence.push(bestNextNail);

      const chosenPath = this.getLinePath(currentNail, bestNextNail);
      for (let i = 0; i < chosenPath.length; i++) {
        const idx = chosenPath[i];
        this.imgData[idx] = Math.min(255, this.imgData[idx] + this.lineWeight);
      }

      currentNail = bestNextNail;
    }

    return sequence;
  }
}