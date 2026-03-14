import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";

export interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

interface MentionListProps {
  items: { id: string; name: string }[];
  command: (item: { id: string; label: string }) => void;
}

export const MentionList = forwardRef<MentionListRef, MentionListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);
    const [prevItems, setPrevItems] = useState(items);

    if (prevItems !== items) {
      setPrevItems(items);
      if (selectedIndex !== 0) setSelectedIndex(0);
    }

    const scrollToIndex = useCallback((index: number) => {
      requestAnimationFrame(() => {
        (listRef.current?.children[index] as HTMLElement)?.scrollIntoView({ block: "nearest" });
      });
    }, []);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === "ArrowUp") {
          const next = selectedIndex > 0 ? selectedIndex - 1 : items.length - 1;
          setSelectedIndex(next);
          scrollToIndex(next);
          return true;
        }
        if (event.key === "ArrowDown") {
          const next = selectedIndex < items.length - 1 ? selectedIndex + 1 : 0;
          setSelectedIndex(next);
          scrollToIndex(next);
          return true;
        }
        if (event.key === "Enter") {
          const item = items[selectedIndex];
          if (item) {
            command({ id: item.id, label: item.name });
            return true;
          }
        }
        return false;
      },
    }));

    if (items.length === 0) return null;

    return (
      <div
        ref={listRef}
        className="max-h-48 overflow-y-auto rounded-lg border bg-card p-1 shadow-lg"
        role="listbox"
      >
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            role="option"
            aria-selected={i === selectedIndex}
            className={`w-full cursor-pointer rounded px-3 py-1.5 text-left text-sm hover:bg-accent ${i === selectedIndex ? "bg-accent" : ""}`}
            onClick={() => command({ id: item.id, label: item.name })}
          >
            {item.name}
          </button>
        ))}
      </div>
    );
  },
);

MentionList.displayName = "MentionList";
