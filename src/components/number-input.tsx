"use client";

import { useState } from "react";

type NumberInputProps = {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: string;
  className?: string;
  placeholder?: string;
};

export function NumberInput({
  value,
  onValueChange,
  min = 0,
  max,
  step = "any",
  className,
  placeholder,
}: NumberInputProps) {
  const [draft, setDraft] = useState("");
  const [focused, setFocused] = useState(false);
  const displayValue = focused ? draft : value > 0 ? String(value) : "";

  function commit(nextDraft: string) {
    setDraft(nextDraft);
    if (nextDraft.trim() === "") {
      return;
    }

    const parsed = Number(nextDraft);
    if (!Number.isFinite(parsed)) {
      return;
    }

    const lowerBounded = Math.max(min, parsed);
    const bounded = max === undefined ? lowerBounded : Math.min(max, lowerBounded);
    onValueChange(bounded);
  }

  function finishEditing() {
    setFocused(false);
    if (draft.trim() === "") {
      onValueChange(min);
      setDraft(min > 0 ? String(min) : "");
      return;
    }

    const parsed = Number(draft);
    const lowerBounded = Number.isFinite(parsed) ? Math.max(min, parsed) : min;
    const bounded = max === undefined ? lowerBounded : Math.min(max, lowerBounded);
    onValueChange(bounded);
    setDraft(bounded > 0 ? String(bounded) : "");
  }

  return (
    <input
      inputMode="decimal"
      step={step}
      value={displayValue}
      placeholder={placeholder}
      onFocus={() => {
        setFocused(true);
        setDraft(value > 0 ? String(value) : "");
      }}
      onBlur={finishEditing}
      onChange={(event) => commit(event.target.value.replace(/[^\d.]/g, ""))}
      className={className}
    />
  );
}
