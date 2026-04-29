const axios = require('axios');

// DeepL API 설정
const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate'; // 무료 버전 사용

// 언어 코드 매핑 (Google STT → DeepL)
const LANGUAGE_MAPPING = {
  'ko-KR': 'KO',
  'en-US': 'EN',
  'en-GB': 'EN',
  'ja-JP': 'JA',
  'zh-CN': 'ZH',
  'es-ES': 'ES',
  'fr-FR': 'FR',
  'de-DE': 'DE'
};

// 번역 결과 캐시 (메모리 기반)
const translationCache = new Map();

// 5분마다 캐시 정리
setInterval(() => {
  const now = Date.now();
  const FIVE_MINUTES = 5 * 60 * 1000;
  
  for (const [key, value] of translationCache.entries()) {
    if (now - value.timestamp > FIVE_MINUTES) {
      translationCache.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * 텍스트를 번역하는 함수
 * @param {string} text - 번역할 텍스트
 * @param {string} sourceLanguage - 원본 언어 (Google STT 형식: ko-KR, en-US 등)
 * @param {string} targetLanguage - 대상 언어 (현재는 영어로 고정: EN)
 * @returns {Promise<Object>} 번역 결과
 */
const translateText = async (text, sourceLanguage = 'ko-KR', targetLanguage = 'EN') => {
  if (!DEEPL_API_KEY) {
    throw new Error('DEEPL_API_KEY가 설정되지 않았습니다.');
  }

  if (!text || text.trim().length === 0) {
    console.log('⚠️ 번역할 텍스트가 비어있습니다.');
    return {
      originalText: text,
      translatedText: '',
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
      confidence: 0
    };
  }

  try {
    // 캐시 키 생성
    const cacheKey = `${text}_${sourceLanguage}_${targetLanguage}`;
    
    // 캐시 확인
    const cachedResult = translationCache.get(cacheKey);
    if (cachedResult) {
      console.log('🔄 번역 캐시 적중:', text.substring(0, 30) + '...');
      return cachedResult.result;
    }

    // 언어 코드 변환
    const deeplSourceLang = LANGUAGE_MAPPING[sourceLanguage] || 'AUTO';
    const deeplTargetLang = LANGUAGE_MAPPING[targetLanguage] || targetLanguage;

    console.log('🌐 번역 시작:', {
      text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      from: `${sourceLanguage} (${deeplSourceLang})`,
      to: `${targetLanguage} (${deeplTargetLang})`
    });

    // DeepL API 호출
    const response = await axios.post(
      DEEPL_API_URL,
      new URLSearchParams({
        'auth_key': DEEPL_API_KEY,
        'text': text,
        'source_lang': deeplSourceLang === 'AUTO' ? '' : deeplSourceLang,
        'target_lang': deeplTargetLang,
        'preserve_formatting': '1',
        'split_sentences': '1'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000 // 10초 타임아웃
      }
    );

    if (response.data && response.data.translations && response.data.translations.length > 0) {
      const translation = response.data.translations[0];
      
      const result = {
        originalText: text,
        translatedText: translation.text,
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage,
        detectedSourceLanguage: translation.detected_source_language || sourceLanguage,
        confidence: 0.95, // DeepL은 confidence를 제공하지 않으므로 고정값 사용
        timestamp: Date.now()
      };

      // 결과 캐시에 저장
      translationCache.set(cacheKey, {
        result: result,
        timestamp: Date.now()
      });

      console.log('✅ 번역 완료:', {
        original: text.substring(0, 30) + '...',
        translated: translation.text.substring(0, 30) + '...',
        detectedLang: translation.detected_source_language
      });

      return result;
    } else {
      throw new Error('번역 결과가 비어있습니다.');
    }

  } catch (error) {
    console.error('❌ 번역 오류:', {
      error: error.message,
      text: text.substring(0, 30) + '...',
      sourceLanguage,
      targetLanguage
    });

    // 에러 발생 시 원본 텍스트 반환
    return {
      originalText: text,
      translatedText: text, // 번역 실패 시 원본 텍스트 그대로 반환
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
      error: error.message,
      confidence: 0,
      timestamp: Date.now()
    };
  }
};

/**
 * 지원되는 언어 목록 가져오기
 * @returns {Promise<Array>} 지원되는 언어 목록
 */
const getSupportedLanguages = async () => {
  if (!DEEPL_API_KEY) {
    throw new Error('DEEPL_API_KEY가 설정되지 않았습니다.');
  }

  try {
    const response = await axios.get(
      'https://api-free.deepl.com/v2/languages',
      {
        params: {
          'auth_key': DEEPL_API_KEY,
          'type': 'target'
        },
        timeout: 5000
      }
    );

    return response.data || [];
  } catch (error) {
    console.error('❌ 지원 언어 목록 조회 오류:', error.message);
    return [];
  }
};

module.exports = {
  translateText,
  getSupportedLanguages,
  LANGUAGE_MAPPING
}; 