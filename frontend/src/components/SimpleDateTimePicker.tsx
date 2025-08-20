'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

interface DateTimePickerProps {
  value: string; // format: YYYY-MM-DDTHH:MM
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SimpleDateTimePicker({ value, onChange }: DateTimePickerProps) {
  // Split into date/time parts for maximum browser compatibility
  const datePart = value ? value.slice(0, 10) : '';
  const timePart = value ? value.slice(11, 16) : '';

  const update = (nextDate: string, nextTime: string) => {
    if (!nextDate && !nextTime) {
      onChange('');
      return;
    }
    // Fallbacks to keep previously selected part if only one changed
    const d = nextDate || datePart || new Date().toISOString().slice(0, 10);
    const t = nextTime || timePart || '00:00';
    onChange(`${d}T${t}`);
  };

  // Custom time dropdown (5-minute increments)
  const [open, setOpen] = useState(false);
  const timeRef = useRef<HTMLDivElement>(null);
  const times = useMemo(() => {
    const arr: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 5) {
        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        arr.push(`${hh}:${mm}`);
      }
    }
    return arr;
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!timeRef.current) return;
      if (!timeRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div className="w-full grid grid-cols-2 gap-2">
      <input
        type="date"
        value={datePart}
        onChange={(e) => update(e.target.value, timePart)}
        className="w-full h-12 px-3 rounded-lg bg-gray-800/90 text-white border border-white/30"
      />
      <div className="relative" ref={timeRef}>
        <button
          type="button"
          className="w-full h-12 px-3 rounded-lg bg-gray-800/90 text-white border border-white/30 text-left flex items-center justify-between"
          onClick={() => setOpen((v) => !v)}
        >
          <span>{timePart || '時間を選択'}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>
        </button>
        {open && (
          <div className="absolute z-50 mt-2 w-full max-h-56 overflow-auto rounded-lg bg-gray-900/95 text-white border border-white/30 shadow-2xl">
            {times.map((t) => (
              <div
                key={t}
                className={`px-3 py-2 cursor-pointer hover:bg-white/10 ${t === timePart ? 'bg-white/10' : ''}`}
                onClick={() => { update(datePart, t); setOpen(false); }}
              >
                {t}
              </div>
            ))}
          </div>
        )}
        {value && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
            onClick={() => onChange('')}
            aria-label="期限をクリア"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}


