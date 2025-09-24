// useResponsive hook for widgets
import { useState, useEffect } from 'react';

interface ResponsiveBreakpoints {
  mobile: boolean;
  tablet: boolean;
  desktop: boolean;
  largeDesktop: boolean;
  containerWidth: number;
  containerHeight: number;
}

export const useResponsive = (containerRef?: React.RefObject<HTMLElement | null>): ResponsiveBreakpoints => {
  const [responsive, setResponsive] = useState<ResponsiveBreakpoints>({
    mobile: false,
    tablet: false,
    desktop: true,
    largeDesktop: false,
    containerWidth: 0,
    containerHeight: 0,
  });

  useEffect(() => {
    const updateResponsive = () => {
      const width = containerRef?.current?.clientWidth || window.innerWidth;
      const height = containerRef?.current?.clientHeight || window.innerHeight;
      
      setResponsive({
        mobile: width < 768,
        tablet: width >= 768 && width < 1024,
        desktop: width >= 1024 && width < 1440,
        largeDesktop: width >= 1440,
        containerWidth: width,
        containerHeight: height,
      });
    };

    updateResponsive();
    
    const resizeObserver = new ResizeObserver(updateResponsive);
    if (containerRef?.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    window.addEventListener('resize', updateResponsive);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateResponsive);
    };
  }, [containerRef]);

  return responsive;
};

// Responsive utilities
export const getResponsiveGridColumns = (width: number): number => {
  if (width < 400) return 1;
  if (width < 600) return 2;
  if (width < 900) return 3;
  if (width < 1200) return 4;
  return 5;
};

export const getResponsiveCardWidth = (containerWidth: number, targetCards: number = 4): number => {
  const padding = 32; // Account for padding and gaps
  const gaps = (targetCards - 1) * 16; // 16px gap between cards
  return Math.max(140, (containerWidth - padding - gaps) / targetCards);
};

export const getResponsiveFontSize = (width: number, base: number = 14): number => {
  const scale = Math.max(0.8, Math.min(1.2, width / 800));
  return Math.round(base * scale);
};
