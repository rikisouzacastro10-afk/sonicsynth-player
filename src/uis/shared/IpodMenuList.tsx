import { useEffect, useRef, type ReactNode } from 'react';
import { computeSlidingScrollTop } from '../../utils/ipodMenuScroll';
import type { IpodMenuItem } from './useIpodOS';

interface IpodMenuListProps {
  items: IpodMenuItem[];
  selectedIndex: number;
  onSelectItem: (index: number, item: IpodMenuItem) => void;
  containerClassName?: string;
  getItemClassName: (selected: boolean) => string;
  renderIndicator?: (selected: boolean) => ReactNode;
}

export function IpodMenuList({
  items,
  selectedIndex,
  onSelectItem,
  containerClassName = '',
  getItemClassName,
  renderIndicator,
}: IpodMenuListProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const container = containerRef.current;
    const activeEl = itemRefs.current[selectedIndex];
    if (!container || !activeEl) return;

    const containerRect = container.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();
    const itemTop = activeRect.top - containerRect.top + container.scrollTop;

    const nextTop = computeSlidingScrollTop({
      currentScrollTop: container.scrollTop,
      containerHeight: container.clientHeight,
      itemTop,
      itemHeight: activeEl.offsetHeight,
      padding: 4,
    });

    if (nextTop !== container.scrollTop) {
      container.scrollTop = nextTop;
    }
  }, [selectedIndex, items.length]);

  useEffect(() => {
    if (containerRef.current && selectedIndex === 0) {
      containerRef.current.scrollTop = 0;
    }
  }, [items, selectedIndex]);

  return (
    <div
      ref={containerRef}
      data-ipod-menu-list="true"
      className={`overflow-hidden touch-none select-none ${containerClassName}`}
    >
      {items.map((item, idx) => {
        const selected = idx === selectedIndex;
        return (
          <button
            key={item.id}
            ref={(el) => {
              itemRefs.current[idx] = el;
            }}
            type="button"
            data-ipod-selected={selected ? 'true' : 'false'}
            onClick={() => onSelectItem(idx, item)}
            className={getItemClassName(selected)}
          >
            <span className="truncate">{item.label}</span>
            {renderIndicator ? renderIndicator(selected) : null}
          </button>
        );
      })}
    </div>
  );
}
