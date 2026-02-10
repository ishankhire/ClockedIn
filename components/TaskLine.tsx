"use client";

import { useRef, useEffect, memo } from "react";
import { TaskLine as TaskLineType } from "@/lib/types";

interface TaskLineProps {
  line: TaskLineType;
  index: number;
  onTextChange: (text: string) => void;
  onCheckToggle: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  focusRef: (el: HTMLSpanElement | null) => void;
  isSelected?: boolean;
  onGutterMouseDown?: (e: React.MouseEvent) => void;
  onTextMouseDown?: () => void;
  onClick?: () => void;
}

function TaskLineComponent({
  line,
  index,
  onTextChange,
  onCheckToggle,
  onKeyDown,
  focusRef,
  isSelected = false,
  onGutterMouseDown,
  onTextMouseDown,
  onClick,
}: TaskLineProps) {
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const lastTextRef = useRef(line.text);

  // Sync text from props only when it changes externally
  useEffect(() => {
    if (spanRef.current && line.text !== lastTextRef.current) {
      if (document.activeElement !== spanRef.current) {
        spanRef.current.textContent = line.text;
      }
      lastTextRef.current = line.text;
    }
  }, [line.text]);

  // Set initial text content
  useEffect(() => {
    if (spanRef.current && spanRef.current.textContent !== line.text) {
      spanRef.current.textContent = line.text;
    }
  }, []);

  const handleInput = () => {
    if (spanRef.current) {
      const text = spanRef.current.textContent || "";
      lastTextRef.current = text;
      onTextChange(text);
    }
  };

  const setRef = (el: HTMLSpanElement | null) => {
    spanRef.current = el;
    focusRef(el);
  };

  return (
    <div
      data-line-index={index}
      className={`flex items-start gap-1 py-0.5 group min-h-[24px] px-2 -mx-2 rounded transition-colors ${
        isSelected ? "bg-accent/15 ring-1 ring-accent/30" : ""
      }`}
      onClick={onClick}
    >
      {/* Selection gutter - click here to select lines */}
      <div
        className="w-4 flex-shrink-0 flex items-center justify-center cursor-pointer self-stretch select-none"
        onMouseDown={onGutterMouseDown}
      >
        <div
          className={`w-1.5 h-1.5 rounded-full transition-all ${
            isSelected
              ? "bg-accent scale-125"
              : "bg-transparent group-hover:bg-border"
          }`}
        />
      </div>
      {line.isCheckbox && (
        <input
          type="checkbox"
          checked={line.checked}
          onChange={onCheckToggle}
          className="mt-0.5 h-4 w-4 rounded border-border text-accent focus:ring-accent cursor-pointer flex-shrink-0"
        />
      )}
      <span
        ref={setRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={onKeyDown}
        onMouseDown={onTextMouseDown}
        className={`task-line-text flex-1 text-sm leading-6 outline-none ${
          line.checked ? "task-line-checked" : "text-text-primary"
        }`}
        data-placeholder="Type here..."
      />
    </div>
  );
}

export default memo(TaskLineComponent);
