class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.isProcessing = false;
    this.sampleRate = 48000;
    this.bufferSize = this.sampleRate; // 1초 길이의 버퍼
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
    this.audioDataCount = 0;
    this.lastVolumeLogTime = 0;
    this.lastProcessingState = false;
    
    console.log('🎵 AudioWorklet 초기화 완료');
    
    this.port.onmessage = (event) => {
      if (event.data.hasOwnProperty('isProcessing')) {
        const newState = event.data.isProcessing;
        if (this.lastProcessingState !== newState) {
          this.isProcessing = newState;
          console.log(`🔄 음성 처리 상태 변경: ${newState ? '시작' : '중지'}`);
          this.lastProcessingState = newState;
        }
      }
    };
  }

  process(inputs, outputs, parameters) {
    if (!this.isProcessing) return true;

    const input = inputs[0];
    if (!input || input.length === 0) return true;

    const inputChannel = input[0];
    if (!inputChannel || inputChannel.length === 0) return true;

    // 볼륨 계산
    let sum = 0;
    for (let i = 0; i < inputChannel.length; i++) {
      sum += inputChannel[i] * inputChannel[i];
    }
    const volume = Math.sqrt(sum / inputChannel.length);

    // 볼륨 로그 throttling (5초에 1번만 - 로그 감소)
    const now = Date.now();
    if (now - this.lastVolumeLogTime > 5000) {
      this.port.postMessage({
        type: 'volume',
        volume: volume
      });
      this.lastVolumeLogTime = now;
    }

    // 버퍼에 오디오 데이터 추가
    for (let i = 0; i < inputChannel.length; i++) {
      this.buffer[this.bufferIndex] = inputChannel[i];
      this.bufferIndex++;

      if (this.bufferIndex >= this.bufferSize) {
        // 버퍼가 가득 찬 경우 데이터 전송
        this.audioDataCount++;
        
        // 16-bit PCM으로 변환
        const pcmData = new Int16Array(this.bufferSize);
        for (let j = 0; j < this.bufferSize; j++) {
          pcmData[j] = Math.max(-32768, Math.min(32767, this.buffer[j] * 32767));
        }

        this.port.postMessage({
          type: 'audioData',
          audioData: pcmData.buffer,
          volume: volume
        });

        // 버퍼 초기화
        this.bufferIndex = 0;
        this.buffer.fill(0);
      }
    }

    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor); 