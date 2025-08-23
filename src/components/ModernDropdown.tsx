'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface DropdownOption {
  value: string;
  label: string;
}

interface ModernDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
}

export default function ModernDropdown({ 
  options, 
  value, 
  onChange, 
  placeholder = "選択してください",
  className = "",
  buttonClassName = ""
}: ModernDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`modern-dropdown ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className={`dropdown-button ${isOpen ? 'open' : ''} ${buttonClassName} ${
          theme === 'light' 
            ? 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50' 
            : 'bg-white/8 border-white/15 text-white hover:bg-white/12'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-truncate">{displayText}</span>
        <svg className="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
      </button>
      
      <div className={`dropdown-list ${isOpen ? 'open' : ''} ${
        theme === 'light' 
          ? 'bg-white border-gray-200 shadow-lg' 
          : 'bg-white/8 border-white/15'
      }`}>
        {options.map((option) => (
          <div
            key={option.value}
            className={`dropdown-item ${value === option.value ? 'selected' : ''} ${
              theme === 'light' 
                ? 'text-gray-900 hover:bg-gray-100' 
                : 'text-white hover:bg-white/12'
            }`}
            onClick={() => handleSelect(option.value)}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
}
