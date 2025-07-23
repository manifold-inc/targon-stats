"use client";

import { useEffect, useState, useRef } from "react";
import { Search as SearchIcon, X, ChevronDown } from "lucide-react";

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export default function Search({
  value,
  onChange,
  onClear,
  placeholder = "Search by UUID...",
}: SearchProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [availableUids, setAvailableUids] = useState<string[]>([]);
  const [filteredUids, setFilteredUids] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch all available UIDs on component mount
  useEffect(() => {
    const fetchUids = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/miners');
        const data = await response.json();
        if (data.success && data.data) {
          const uids = data.data.map((miner: { uid: string }) => miner.uid).sort((a: string, b: string) => parseInt(a) - parseInt(b));
          setAvailableUids(uids);
          setFilteredUids(uids);
        }
      } catch (error) {
        console.error('Failed to fetch UIDs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUids();
  }, []);

  // Filter UIDs based on input value
  useEffect(() => {
    const currentInput = value.toLowerCase().trim();
    
    // Parse already selected UIDs (everything before the last comma)
    const parts = value.split(',');
    const alreadySelected = parts.slice(0, -1).map(uid => uid.trim()).filter(Boolean);
    const currentTyping = parts[parts.length - 1]?.trim() || '';
    
    // Filter out already selected UIDs
    const availableForSelection = availableUids.filter(uid => 
      !alreadySelected.includes(uid)
    );
    
    if (!currentTyping) {
      setFilteredUids(availableForSelection);
    } else {
      const filtered = availableForSelection.filter(uid => 
        uid.toLowerCase().includes(currentTyping.toLowerCase())
      );
      setFilteredUids(filtered);
    }
  }, [value, availableUids]);

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);
    
    // Always show dropdown when typing, especially when comma is added
    setIsDropdownOpen(true);
  };

  const handleUidSelect = (uid: string) => {
    const parts = value.split(',');
    const alreadySelected = parts.slice(0, -1).map(u => u.trim()).filter(Boolean);
    
    // If there are already selected UIDs, append the new one
    if (alreadySelected.length > 0) {
      const newValue = alreadySelected.join(', ') + ', ' + uid;
      onChange(newValue);
    } else {
      onChange(uid);
    }
    
    setIsDropdownOpen(false);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleClear = () => {
    onChange("");
    onClear();
    setIsDropdownOpen(false);
  };

  // Get the current typing part (after the last comma)
  const getCurrentTypingPart = () => {
    const parts = value.split(',');
    return parts[parts.length - 1]?.trim() || '';
  };

  // Get already selected UIDs count for display
  const getSelectedCount = () => {
    const parts = value.split(',');
    return parts.slice(0, -1).map(uid => uid.trim()).filter(Boolean).length;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <SearchIcon className="h-5 w-5 text-mf-edge-700" />
        </div>
                 <input
           ref={inputRef}
           type="text"
           value={value}
           onChange={(e) => handleInputChange(e.target.value)}
           onFocus={handleInputFocus}
           className="placeholder-font-poppins block w-full rounded-lg border border-gray-600 bg-mf-night-500 py-2 pl-10 pr-10 text-sm text-mf-edge-700 placeholder-mf-edge-700 focus:border-mf-sally-500 focus:outline-none focus:ring-2 focus:ring-mf-sally-500"
           placeholder={placeholder}
         />
        <div className="absolute inset-y-0 right-0 flex items-center">
          {value && (
            <button
              onClick={handleClear}
              className="px-2 py-2 text-gray-500 hover:opacity-80 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-2 py-2 text-mf-edge-700 hover:opacity-80"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

             {/* Dropdown */}
       {isDropdownOpen && (
                  <div 
           className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-600 bg-mf-night-500 shadow-lg [&::-webkit-scrollbar]:hidden"
           style={{ 
             scrollbarWidth: 'none', 
             msOverflowStyle: 'none'
           }}
         >
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-mf-edge-700">Loading UIDs...</div>
          ) : filteredUids.length > 0 ? (
            filteredUids.map((uid) => (
              <button
                key={uid}
                onClick={() => handleUidSelect(uid)}
                className="block w-full px-4 py-2 text-left text-sm text-mf-edge-700 hover:bg-mf-ash-500/30 focus:bg-mf-ash-500/30 focus:outline-none"
              >
                <span className="font-mono">{uid}</span>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-mf-edge-700">
              {availableUids.length === 0 ? 'No UIDs available' : 'No matching UIDs found'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
