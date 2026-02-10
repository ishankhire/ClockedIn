"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { TaskLine as TaskLineType } from "@/lib/types";
import { generateId } from "@/lib/utils";
import TaskLine from "./TaskLine";

interface TaskEditorProps {
  tasks: TaskLineType[];
  onChange: (tasks: TaskLineType[]) => void;
}

function createLine(isCheckbox = false): TaskLineType {
  return { id: generateId(), text: "", isCheckbox, checked: false };
}

export default function TaskEditor({ tasks, onChange }: TaskEditorProps) {
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedLines, setSelectedLines] = useState<Set<number>>(new Set());
  const [selectionAnchor, setSelectionAnchor] = useState<number | null>(null);
  const [currentFocusedIndex, setCurrentFocusedIndex] = useState<number>(0);
  const [collapsed, setCollapsed] = useState(false);

  // Drag-to-select refs (refs, not state, to avoid re-renders during drag)
  const dragStartRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const didCrossLineDragRef = useRef(false);

  const focusLine = useCallback((index: number) => {
    setCurrentFocusedIndex(index);
    requestAnimationFrame(() => {
      const el = lineRefs.current[index];
      if (el) {
        el.focus();
        const range = document.createRange();
        const sel = window.getSelection();
        if (el.childNodes.length > 0) {
          range.setStartAfter(el.lastChild!);
        } else {
          range.setStart(el, 0);
        }
        range.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    });
  }, []);

  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      // Skip if a cross-line drag just ended (click fires on common ancestor)
      if (didCrossLineDragRef.current) {
        didCrossLineDragRef.current = false;
        return;
      }
      if (e.target === containerRef.current || e.target === e.currentTarget) {
        const lastIndex = tasks.length > 0 ? tasks.length - 1 : 0;
        let targetIndex = lastIndex;
        for (let i = tasks.length - 1; i >= 0; i--) {
          if (tasks[i].text.trim() !== "") {
            targetIndex = i;
            break;
          }
        }
        focusLine(targetIndex);
        setSelectedLines(new Set());
      }
    },
    [tasks, focusLine]
  );

  const toggleCurrentLineCheckbox = useCallback(() => {
    const updated = [...tasks];
    const current = updated[currentFocusedIndex];
    if (current) {
      updated[currentFocusedIndex] = {
        ...current,
        isCheckbox: !current.isCheckbox,
        checked: current.isCheckbox ? false : current.checked,
      };
      onChange(updated);
      focusLine(currentFocusedIndex);
    }
  }, [tasks, onChange, focusLine, currentFocusedIndex]);

  const deleteSelectedLines = useCallback(() => {
    if (selectedLines.size === 0) return;
    const updated = tasks.filter((_, i) => !selectedLines.has(i));
    if (updated.length === 0) {
      onChange([createLine()]);
    } else {
      onChange(updated);
    }
    setSelectedLines(new Set());
    setSelectionAnchor(null);
  }, [selectedLines, tasks, onChange]);

  // Gutter clicks handle line selection — separate from text editing
  const handleGutterMouseDown = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.preventDefault();
      if (e.shiftKey && selectionAnchor !== null) {
        const start = Math.min(selectionAnchor, index);
        const end = Math.max(selectionAnchor, index);
        const newSelection = new Set<number>();
        for (let i = start; i <= end; i++) {
          newSelection.add(i);
        }
        setSelectedLines(newSelection);
      } else if (e.metaKey || e.ctrlKey) {
        const newSelection = new Set(selectedLines);
        if (newSelection.has(index)) {
          newSelection.delete(index);
        } else {
          newSelection.add(index);
        }
        setSelectedLines(newSelection);
        setSelectionAnchor(index);
      } else {
        if (selectedLines.has(index) && selectedLines.size === 1) {
          setSelectedLines(new Set());
          setSelectionAnchor(null);
        } else {
          setSelectedLines(new Set([index]));
          setSelectionAnchor(index);
        }
      }
    },
    [selectionAnchor, selectedLines]
  );

  // When mousedown happens on text, start tracking for drag-to-select
  const handleTextMouseDown = useCallback((index: number) => {
    dragStartRef.current = index;
    isDraggingRef.current = true;
    didCrossLineDragRef.current = false;
    // Don't preventDefault — allow native text selection within the line
  }, []);

  // Clicking on a line's text clears any line selection
  const handleLineClick = useCallback(
    (index: number) => {
      if (didCrossLineDragRef.current) {
        didCrossLineDragRef.current = false;
        return;
      }
      if (selectedLines.size > 0) {
        setSelectedLines(new Set());
        setSelectionAnchor(null);
      }
      setCurrentFocusedIndex(index);
    },
    [selectedLines]
  );

  // Document-level mousemove/mouseup for drag-to-select across lines
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || dragStartRef.current === null) return;
      if (!containerRef.current) return;

      // Find which line the mouse Y is over by checking child positions
      const children = containerRef.current.children;
      const y = e.clientY;
      let targetIndex = children.length - 1;

      for (let i = 0; i < children.length; i++) {
        const rect = (children[i] as HTMLElement).getBoundingClientRect();
        if (y <= rect.bottom) {
          targetIndex = i;
          break;
        }
      }

      if (targetIndex !== dragStartRef.current) {
        // Mouse crossed to a different line — switch to line-level selection
        window.getSelection()?.removeAllRanges();

        const start = Math.min(dragStartRef.current, targetIndex);
        const end = Math.max(dragStartRef.current, targetIndex);
        const newSelection = new Set<number>();
        for (let i = start; i <= end; i++) {
          newSelection.add(i);
        }
        setSelectedLines(newSelection);
        setSelectionAnchor(dragStartRef.current);
        didCrossLineDragRef.current = true;
      } else if (didCrossLineDragRef.current) {
        // Dragged back to starting line — clear the cross-line selection
        setSelectedLines(new Set());
        setSelectionAnchor(null);
        didCrossLineDragRef.current = false;
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      dragStartRef.current = null;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Global keyboard shortcuts: Cmd+K for checkbox, Delete for selected, Escape to deselect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggleCurrentLineCheckbox();
      } else if (
        (e.key === "Backspace" || e.key === "Delete") &&
        selectedLines.size > 0
      ) {
        e.preventDefault();
        deleteSelectedLines();
      } else if (e.key === "Escape" && selectedLines.size > 0) {
        setSelectedLines(new Set());
        setSelectionAnchor(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleCurrentLineCheckbox, selectedLines, deleteSelectedLines]);

  const handleTextChange = useCallback(
    (index: number, text: string) => {
      const updated = [...tasks];
      updated[index] = { ...updated[index], text };
      onChange(updated);
    },
    [tasks, onChange]
  );

  const handleCheckToggle = useCallback(
    (index: number) => {
      const updated = [...tasks];
      updated[index] = { ...updated[index], checked: !updated[index].checked };
      onChange(updated);
    },
    [tasks, onChange]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      setCurrentFocusedIndex(index);

      if (e.key === "Enter") {
        e.preventDefault();
        const updated = [...tasks];
        const newLine = createLine(e.shiftKey ? false : tasks[index].isCheckbox);
        updated.splice(index + 1, 0, newLine);
        onChange(updated);
        focusLine(index + 1);
        setSelectedLines(new Set());
      } else if (e.key === "ArrowUp" && !e.shiftKey) {
        if (index > 0) {
          e.preventDefault();
          setSelectedLines(new Set());
          focusLine(index - 1);
        }
      } else if (e.key === "ArrowDown" && !e.shiftKey) {
        if (index < tasks.length - 1) {
          e.preventDefault();
          setSelectedLines(new Set());
          focusLine(index + 1);
        }
      } else if (e.key === "Backspace") {
        if (selectedLines.size > 0) return;

        const span = e.target as HTMLSpanElement;
        const sel = window.getSelection();
        const range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
        const cursorAtStart =
          range && range.collapsed && range.startOffset === 0;

        if (cursorAtStart && tasks[index].text === "" && tasks.length > 1) {
          e.preventDefault();
          const updated = tasks.filter((_, i) => i !== index);
          onChange(updated);
          focusLine(Math.max(0, index - 1));
        } else if (
          cursorAtStart &&
          tasks[index].isCheckbox &&
          span.textContent === tasks[index].text
        ) {
          e.preventDefault();
          const updated = [...tasks];
          updated[index] = {
            ...updated[index],
            isCheckbox: false,
            checked: false,
          };
          onChange(updated);
          focusLine(index);
        }
      }
    },
    [tasks, onChange, focusLine, selectedLines]
  );

  const displayTasks = tasks.length > 0 ? tasks : [createLine()];

  return (
    <div className="rounded-2xl border border-border bg-bg-surface shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 text-sm font-semibold text-text-secondary uppercase tracking-wider hover:text-text-primary transition-colors"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform ${
              collapsed ? "-rotate-90" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
          Tasks
        </button>
        {!collapsed && (
          <div className="flex gap-2 items-center">
            {selectedLines.size > 0 && (
              <>
                <span className="text-xs text-text-tertiary">
                  {selectedLines.size} selected
                </span>
                <button
                  onClick={deleteSelectedLines}
                  title="Delete selected lines"
                  className="text-xs px-2 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  Delete
                </button>
              </>
            )}
            <button
              onClick={toggleCurrentLineCheckbox}
              title="Toggle checkbox (Cmd+K)"
              className="text-xs px-2 py-1 rounded-lg bg-bg-accent text-text-secondary hover:bg-border hover:text-text-primary transition-colors"
            >
              ☑ Checkbox
            </button>
          </div>
        )}
      </div>
      {!collapsed && (
        <div
          ref={containerRef}
          onClick={handleContainerClick}
          className="flex-1 overflow-y-auto px-6 pb-5 cursor-text"
        >
          {displayTasks.map((line, index) => (
            <TaskLine
              key={line.id}
              index={index}
              line={line}
              onTextChange={(text) => handleTextChange(index, text)}
              onCheckToggle={() => handleCheckToggle(index)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              focusRef={(el) => {
                lineRefs.current[index] = el;
              }}
              isSelected={selectedLines.has(index)}
              onGutterMouseDown={(e) => handleGutterMouseDown(index, e)}
              onTextMouseDown={() => handleTextMouseDown(index)}
              onClick={() => handleLineClick(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
