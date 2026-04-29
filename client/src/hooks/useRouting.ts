'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useRef } from 'react';

interface UseRoutingOptions {
  preventDuplicateNavigation?: boolean;
  navigationDelay?: number;
}

export function useRouting(options: UseRoutingOptions = {}) {
  const {
    preventDuplicateNavigation = true,
    navigationDelay = 0
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastNavigationRef = useRef<string | null>(null);

  // 안전한 네비게이션 함수
  const safeNavigate = useCallback((targetPath: string, options: {
    replace?: boolean;
    force?: boolean;
    onBefore?: () => void;
    onAfter?: () => void;
    onError?: (error: Error) => void;
  } = {}) => {
    const {
      replace = false,
      force = false,
      onBefore,
      onAfter,
      onError
    } = options;

    try {
      // 이전 네비게이션 취소
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
        navigationTimeoutRef.current = null;
      }

      // 중복 네비게이션 방지
      if (preventDuplicateNavigation && !force) {
        if (pathname === targetPath) {
          console.log('🚫 중복 네비게이션 방지:', pathname, '->', targetPath);
          return false;
        }

        if (lastNavigationRef.current === targetPath) {
          console.log('🚫 연속 네비게이션 방지:', lastNavigationRef.current, '->', targetPath);
          return false;
        }
      }

      // 네비게이션 전 콜백
      onBefore?.();

      const navigate = () => {
        try {
          console.log('🔄 페이지 이동:', pathname, '->', targetPath);
          lastNavigationRef.current = targetPath;

          if (replace) {
            router.replace(targetPath);
          } else {
            router.push(targetPath);
          }

          // 네비게이션 후 콜백
          onAfter?.();
        } catch (error) {
          console.error('❌ 네비게이션 실패:', error);
          onError?.(error instanceof Error ? error : new Error('Navigation failed'));
        }
      };

      // 지연 네비게이션
      if (navigationDelay > 0) {
        navigationTimeoutRef.current = setTimeout(navigate, navigationDelay);
      } else {
        navigate();
      }

      return true;
    } catch (error) {
      console.error('❌ 네비게이션 준비 실패:', error);
      onError?.(error instanceof Error ? error : new Error('Navigation preparation failed'));
      return false;
    }
  }, [router, pathname, preventDuplicateNavigation, navigationDelay]);

  // 뒤로 가기
  const goBack = useCallback((fallbackPath?: string) => {
    try {
      if (window.history.length > 1) {
        router.back();
      } else if (fallbackPath) {
        safeNavigate(fallbackPath, { replace: true });
      } else {
        safeNavigate('/', { replace: true });
      }
    } catch (error) {
      console.error('❌ 뒤로 가기 실패:', error);
      if (fallbackPath) {
        safeNavigate(fallbackPath, { replace: true });
      }
    }
  }, [router, safeNavigate]);

  // 미팅룸으로 이동
  const navigateToMeetingRoom = useCallback((pin: string, options: {
    force?: boolean;
    onBefore?: () => void;
    onAfter?: () => void;
    onError?: (error: Error) => void;
    queryParams?: string;
  } = {}) => {
    const { queryParams, ...navigationOptions } = options;
    const targetPath = queryParams ? `/meeting/${pin}?${queryParams}` : `/meeting/${pin}`;
    return safeNavigate(targetPath, navigationOptions);
  }, [safeNavigate]);

  // 메인 페이지로 이동
  const navigateToHome = useCallback((options: {
    replace?: boolean;
    onBefore?: () => void;
    onAfter?: () => void;
  } = {}) => {
    return safeNavigate('/', options);
  }, [safeNavigate]);

  // 미팅 메인 페이지로 이동
  const navigateToMeetingMain = useCallback((options: {
    replace?: boolean;
    onBefore?: () => void;
    onAfter?: () => void;
  } = {}) => {
    return safeNavigate('/meeting', options);
  }, [safeNavigate]);

  // 현재 경로 확인 유틸리티
  const isCurrentPath = useCallback((path: string) => {
    return pathname === path;
  }, [pathname]);

  const isInMeetingRoom = useCallback((pin?: string) => {
    if (pin) {
      return pathname === `/meeting/${pin}`;
    }
    return pathname.startsWith('/meeting/') && pathname !== '/meeting';
  }, [pathname]);

  // 정리 함수
  const cleanup = useCallback(() => {
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = null;
    }
  }, []);

  return {
    // 현재 상태
    pathname,
    
    // 네비게이션 함수들
    safeNavigate,
    goBack,
    navigateToMeetingRoom,
    navigateToHome,
    navigateToMeetingMain,
    
    // 유틸리티 함수들
    isCurrentPath,
    isInMeetingRoom,
    
    // 정리 함수
    cleanup
  };
} 