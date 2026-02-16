
import React, { useRef, useState, useEffect, useMemo } from 'react';

interface VirtualListProps<T> {
  items: T[];
  height: number | string; // Container height
  itemHeight: number;
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  className?: string;
  overscan?: number; // Number of items to render outside visible area
}

/**
 * HIGH-PERFORMANCE VIRTUAL SCROLLER
 * Renders only visible items + overscan buffer.
 * Complexity: O(visible_items) instead of O(total_items).
 */
export const VirtualList = <T,>({ 
  items, 
  height, 
  itemHeight, 
  renderItem, 
  className = '',
  overscan = 5 
}: VirtualListProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Handle scroll events efficiently
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Calculate visible range
  const { startIndex, endIndex, totalHeight } = useMemo(() => {
    const totalHeight = items.length * itemHeight;
    
    // Determine container height (fixed px or estimate if string)
    // For string (e.g. '100%'), we rely on the containerRef clientHeight update,
    // but for initial render we might assume a viewport height or 0.
    const containerH = containerRef.current ? containerRef.current.clientHeight : 600; 

    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerH / itemHeight);
    
    const startIndex = Math.max(0, start - overscan);
    const endIndex = Math.min(items.length, start + visibleCount + overscan);

    return { startIndex, endIndex, totalHeight };
  }, [items.length, itemHeight, scrollTop, overscan]);

  // Force re-calc on resize
  useEffect(() => {
     const handleResize = () => {
         if (containerRef.current) {
             // Force update by toggling a minimal state or just relying on scroll
             setScrollTop(containerRef.current.scrollTop);
         }
     };
     window.addEventListener('resize', handleResize);
     return () => window.removeEventListener('resize', handleResize);
  }, []);

  const visibleItems = items.slice(startIndex, endIndex).map((item, index) => {
    const absoluteIndex = startIndex + index;
    const style: React.CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: itemHeight,
      transform: `translateY(${absoluteIndex * itemHeight}px)`,
    };
    return renderItem(item, absoluteIndex, style);
  });

  return (
    <div 
      ref={containerRef}
      onScroll={onScroll}
      className={`relative overflow-y-auto will-change-scroll ${className}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems}
      </div>
    </div>
  );
};
