const axios = require('axios');

// Google Cloud TTS API 설정
const GOOGLE_CLOUD_API_KEY = process.env.GOOGLE_CLOUD_API_KEY;
const TTS_ENDPOINT = 'https://texttospeech.googleapis.com/v1/text:synthesize';

// 언어별 음성 설정
const VOICE_CONFIGS = {
  'EN': {
    languageCode: 'en-US',
    name: 'en-US-Wavenet-J', // 자연스러운 여성 음성
    ssmlGender: 'FEMALE'
  },
  'KO': {
    languageCode: 'ko-KR',
    name: 'ko-KR-Wavenet-A', // 자연스러운 여성 음성
    ssmlGender: 'FEMALE'
  },
  'JA': {
    languageCode: 'ja-JP',
    name: 'ja-JP-Wavenet-A',
    ssmlGender: 'FEMALE'
  },
  'ZH': {
    languageCode: 'zh-CN',
    name: 'zh-CN-Wavenet-A',
    ssmlGender: 'FEMALE'
  },
  'ES': {
    languageCode: 'es-ES',
    name: 'es-ES-Wavenet-A',
    ssmlGender: 'FEMALE'
  },
  'FR': {
    languageCode: 'fr-FR',
    name: 'fr-FR-Wavenet-A',
    ssmlGender: 'FEMALE'
  },
  'DE': {
    languageCode: 'de-DE',
    name: 'de-DE-Wavenet-A',
    ssmlGender: 'FEMALE'
  }
};

// TTS 결과 캐시 (메모리 기반)
const ttsCache = new Map();

// 5분마다 캐시 정리
setInterval(() => {
  const now = Date.now();
  const FIVE_MINUTES = 5 * 60 * 1000;
  
  for (const [key, value] of ttsCache.entries()) {
    if (now - value.timestamp > FIVE_MINUTES) {
      ttsCache.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * 텍스트를 음성으로 변환하는 함수
 * @param {string} text - 변환할 텍스트
 * @param {string} languageCode - 언어 코드 (EN, KO, JA 등)
 * @param {Object} options - 추가 옵션 (속도, 피치 등)
 * @returns {Promise<Object>} TTS 결과 (base64 인코딩된 오디오 데이터)
 */
const textToSpeech = async (text, languageCode = 'EN', options = {}) => {
  if (!GOOGLE_CLOUD_API_KEY) {
    throw new Error('GOOGLE_CLOUD_API_KEY가 설정되지 않았습니다.');
  }

  if (!text || text.trim().length === 0) {
    console.log('⚠️ TTS 변환할 텍스트가 비어있습니다.');
    return {
      text: text,
      audioContent: '',
      languageCode: languageCode,
      error: 'Empty text'
    };
  }

  try {
    // 캐시 키 생성
    const cacheKey = `${text}_${languageCode}_${JSON.stringify(options)}`;
    
    // 캐시 확인
    const cachedResult = ttsCache.get(cacheKey);
    if (cachedResult) {
      console.log('🔄 TTS 캐시 적중:', text.substring(0, 30) + '...');
      return cachedResult.result;
    }

    // 음성 설정 가져오기
    const voiceConfig = VOICE_CONFIGS[languageCode] || VOICE_CONFIGS['EN'];
    
    console.log('🔊 TTS 변환 시작:', {
      text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      language: languageCode,
      voice: voiceConfig.name
    });

    // Google Cloud TTS API 요청 데이터 구성
    const requestData = {
      input: {
        text: text
      },
      voice: {
        languageCode: voiceConfig.languageCode,
        name: voiceConfig.name,
        ssmlGender: voiceConfig.ssmlGender
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: options.speakingRate || 1.0, // 말하는 속도 (0.25 ~ 4.0)
        pitch: options.pitch || 0.0, // 피치 (-20.0 ~ 20.0)
        volumeGainDb: options.volumeGainDb || 0.0, // 볼륨 (-96.0 ~ 16.0)
        effectsProfileId: ['headphone-class-device'] // 헤드폰 최적화
      }
    };

    // Google Cloud TTS API 호출
    const response = await axios.post(
      TTS_ENDPOINT,
      requestData,
      {
        params: {
          key: GOOGLE_CLOUD_API_KEY
        },
        timeout: 15000 // 15초 타임아웃 (TTS는 STT보다 시간이 오래 걸림)
      }
    );

    if (response.data && response.data.audioContent) {
      const result = {
        text: text,
        audioContent: response.data.audioContent, // base64 인코딩된 MP3 데이터
        languageCode: languageCode,
        voiceConfig: voiceConfig,
        audioFormat: 'MP3',
        timestamp: Date.now(),
        success: true
      };

      // 결과 캐시에 저장
      ttsCache.set(cacheKey, {
        result: result,
        timestamp: Date.now()
      });

      console.log('✅ TTS 변환 완료:', {
        text: text.substring(0, 30) + '...',
        audioSize: response.data.audioContent.length,
        voice: voiceConfig.name
      });

      return result;
    } else {
      throw new Error('TTS 변환 결과가 비어있습니다.');
    }

  } catch (error) {
    console.error('❌ TTS 변환 오류:', {
      error: error.message,
      text: text.substring(0, 30) + '...',
      languageCode
    });

    // 에러 발생 시 빈 결과 반환
    return {
      text: text,
      audioContent: '',
      languageCode: languageCode,
      error: error.message,
      success: false,
      timestamp: Date.now()
    };
  }
};

/**
 * 지원되는 음성 목록 가져오기
 * @param {string} languageCode - 언어 코드 (선택사항)
 * @returns {Promise<Array>} 지원되는 음성 목록
 */
const getSupportedVoices = async (languageCode = null) => {
  if (!GOOGLE_CLOUD_API_KEY) {
    throw new Error('GOOGLE_CLOUD_API_KEY가 설정되지 않았습니다.');
  }

  try {
    const params = {
      key: GOOGLE_CLOUD_API_KEY
    };

    if (languageCode) {
      params.languageCode = languageCode;
    }

    const response = await axios.get(
      'https://texttospeech.googleapis.com/v1/voices',
      {
        params: params,
        timeout: 5000
      }
    );

    return response.data.voices || [];
  } catch (error) {
    console.error('❌ 지원 음성 목록 조회 오류:', error.message);
    return [];
  }
};

/**
 * 오디오 데이터를 스트리밍 가능한 URL로 변환
 * @param {string} audioContent - base64 인코딩된 오디오 데이터
 * @param {string} format - 오디오 형식 (기본값: MP3)
 * @returns {string} Data URL
 */
const createAudioDataUrl = (audioContent, format = 'MP3') => {
  if (!audioContent) {
    return '';
  }

  const mimeType = format === 'MP3' ? 'audio/mpeg' : 'audio/wav';
  return `data:${mimeType};base64,${audioContent}`;
};

module.exports = {
  textToSpeech,
  getSupportedVoices,
  createAudioDataUrl,
  VOICE_CONFIGS
}; 