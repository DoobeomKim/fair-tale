const axios = require('axios');

// Google Cloud Speech-to-Text API 엔드포인트
const RECOGNIZE_ENDPOINT = 'https://speech.googleapis.com/v1/speech:recognize';
const STREAMING_ENDPOINT = 'https://speech.googleapis.com/v1/speech:streamingRecognize';

// 지원 언어 목록 및 설정
const SUPPORTED_LANGUAGES = {
  'ko-KR': {
    name: '한국어',
    code: 'ko-KR',
    alternatives: ['en-US'],
    model: 'latest_long',
    useEnhanced: true
  },
  'en-US': {
    name: 'English (US)',
    code: 'en-US',
    alternatives: ['ko-KR'],
    model: 'latest_long',
    useEnhanced: true
  },
  'ja-JP': {
    name: '日本語',
    code: 'ja-JP',
    alternatives: ['en-US'],
    model: 'latest_long',
    useEnhanced: true
  },
  'zh-CN': {
    name: '中文 (简体)',
    code: 'zh-CN',
    alternatives: ['en-US'],
    model: 'latest_long',
    useEnhanced: true
  },
  'es-ES': {
    name: 'Español',
    code: 'es-ES',
    alternatives: ['en-US'],
    model: 'latest_long',
    useEnhanced: true
  },
  'fr-FR': {
    name: 'Français',
    code: 'fr-FR',
    alternatives: ['en-US'],
    model: 'latest_long',
    useEnhanced: true
  },
  'de-DE': {
    name: 'Deutsch',
    code: 'de-DE',
    alternatives: ['en-US'],
    model: 'latest_long',
    useEnhanced: true
  }
};

// 기본 설정
const defaultConfig = {
  encoding: 'LINEAR16',
  sampleRateHertz: 48000,
  languageCode: 'ko-KR',
  alternativeLanguageCodes: ['en-US'],
  enableAutomaticPunctuation: true,
  model: 'latest_long',
  enableWordTimeOffsets: true,
  useEnhanced: true,
  metadata: {
    interactionType: 'DISCUSSION',
    microphoneDistance: 'NEARFIELD',
    originalMediaType: 'AUDIO',
    recordingDeviceType: 'PC',
  }
};

// 언어별 최적화된 설정 생성
const createLanguageConfig = (languageCode) => {
  const langSettings = SUPPORTED_LANGUAGES[languageCode];
  
  if (!langSettings) {
    console.warn(`⚠️ 지원하지 않는 언어: ${languageCode}, 기본 언어(ko-KR) 사용`);
    return {
      ...defaultConfig,
      languageCode: 'ko-KR',
      alternativeLanguageCodes: ['en-US']
    };
  }

  return {
    ...defaultConfig,
    languageCode: langSettings.code,
    alternativeLanguageCodes: langSettings.alternatives,
    model: langSettings.model,
    useEnhanced: langSettings.useEnhanced
  };
};

// 결과 캐시 관리
const transcriptionCache = new Map();
const MAX_CACHE_SIZE = 1000;
const CACHE_EXPIRY = 60 * 60 * 1000; // 1시간

// 캐시 정리 함수
const cleanupCache = () => {
  const now = Date.now();
  for (const [key, value] of transcriptionCache.entries()) {
    if (now - value.timestamp > CACHE_EXPIRY) {
      transcriptionCache.delete(key);
    }
  }
  
  // 캐시 크기 제한
  if (transcriptionCache.size > MAX_CACHE_SIZE) {
    const sortedEntries = Array.from(transcriptionCache.entries())
      .sort(([, a], [, b]) => b.timestamp - a.timestamp);
    
    while (transcriptionCache.size > MAX_CACHE_SIZE) {
      const [key] = sortedEntries.pop();
      transcriptionCache.delete(key);
    }
  }
};

// 주기적 캐시 정리
setInterval(cleanupCache, 5 * 60 * 1000); // 5분마다 정리

// 오디오 데이터를 처리하고 텍스트로 변환하는 함수
const processAudioStream = async (audioData, language = 'ko-KR') => {
  try {
    // 캐시 키 생성 (오디오 데이터의 해시)
    const cacheKey = Buffer.from(audioData).toString('base64').slice(0, 100);
    
    // 캐시 확인
    const cachedResult = transcriptionCache.get(cacheKey);
    if (cachedResult) {
      return cachedResult.result;
    }

    const config = createLanguageConfig(language);

    // API 요청 데이터 구성
    const requestData = {
      config: config,
      audio: {
        content: audioData.toString('base64')
      }
    };

    // Google Cloud Speech-to-Text API 호출
    const response = await axios.post(
      `https://speech.googleapis.com/v1/speech:recognize?key=${process.env.GOOGLE_CLOUD_API_KEY}`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000 // 10초 타임아웃
      }
    );

    // 응답 데이터 처리
    const result = response.data;
    
    if (!result || !result.results || result.results.length === 0) {
      return [];
    }

    // 인식된 텍스트와 신뢰도 추출
    const transcriptions = result.results
      .filter(r => r.alternatives && r.alternatives.length > 0)
      .map(r => ({
        transcript: r.alternatives[0].transcript,
        confidence: r.alternatives[0].confidence || 0,
        words: r.alternatives[0].words || [],
        languageCode: r.languageCode || language
      }));

    // 캐시에 저장 (5분 TTL)
    transcriptionCache.set(cacheKey, {
      result: transcriptions,
      timestamp: Date.now()
    }, 300000);

    return transcriptions;
    
  } catch (error) {
    console.error('STT API 오류:', error.message);
    
    // 빈 배열 반환하여 상위에서 처리
    return [];
  }
};

module.exports = {
  processAudioStream,
  defaultConfig,
  SUPPORTED_LANGUAGES,
  createLanguageConfig,
}; 