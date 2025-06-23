export class AudioAnalyzer {
  constructor(analyser, options = {}) {
    this.analyser = analyser;
    this.sampleRate = analyser.context.sampleRate;
    this.fftSize = analyser.fftSize;
    this.freqBinCount = analyser.frequencyBinCount;

    this.minHz = options.minHz || 20;
    this.maxHz = options.maxHz || this.sampleRate / 2;
    this.outputBins = options.outputBins || 64;
    this.scale = options.scale || "byte"; // "byte" or "float"

    this.freqData =
      this.scale === "byte"
        ? new Uint8Array(this.freqBinCount)
        : new Float32Array(this.freqBinCount);

    this.logBinIndices = this._computeLogBinIndices();
  }

  _computeLogBinIndices() {
    const indices = [];
    const nyquist = this.sampleRate / 2;

    for (let i = 0; i < this.outputBins; i++) {
      const t = i / (this.outputBins - 1); // 0..1
      const targetFreq =
        this.minHz * Math.pow(this.maxHz / this.minHz, t); // log spacing
      const binIndex = Math.floor((targetFreq / nyquist) * this.freqBinCount);
      indices.push(Math.min(binIndex, this.freqBinCount - 1));
    }
    return indices;
  }

  getLogFrequencies(normalized = false) {
    if (this.scale === "byte") {
      this.analyser.getByteFrequencyData(this.freqData);
    } else {
      this.analyser.getFloatFrequencyData(this.freqData);
    }

    const values = this.logBinIndices.map((i) => this.freqData[i]);

    if (!normalized) return values;

    // Normalize to 0..1
    if (this.scale === "byte") {
      return values.map((v) => v / 255);
    }

    const min = -100, max = 0; // dB range (typical for float FFT)
    return values.map((v) => Math.min(1, Math.max(0, (v - min) / (max - min))));
  }

  getRawTimeDomain(normalized = false) {
    const timeData =
      this.scale === "byte"
        ? new Uint8Array(this.analyser.fftSize)
        : new Float32Array(this.analyser.fftSize);

    if (this.scale === "byte") {
      this.analyser.getByteTimeDomainData(timeData);
      return normalized ? Array.from(timeData).map((v) => (v - 128) / 128) : timeData;
    } else {
      this.analyser.getFloatTimeDomainData(timeData);
      return normalized ? Array.from(timeData) : timeData;
    }
  }
}
