import React, { useState, useRef, useEffect } from "react";

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  name = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropUp, setDropUp] = useState(false);
  const wrapperRef = useRef(null);

  // Calculate position when opening
  const toggleOpen = () => {
    if (!isOpen && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropUp(spaceBelow < 260);
      setSearchTerm("");
    }
    setIsOpen(!isOpen);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Find the selected option to display its label when closed
  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  // Filter options based on search
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(opt.value).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (val) => {
    onChange({ target: { name, value: val } });
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {/* Trigger Button */}
      <div
        className="w-full border border-[#F8BBD0] bg-[#FFF5F8] focus-within:bg-white text-[#16324A] rounded-xs text-xs px-3 py-2 cursor-pointer flex justify-between items-center focus-within:border-[#E8198A] focus-within:ring-1 focus-within:ring-[#E8198A]"
        onClick={toggleOpen}
      >
        <span className="truncate mr-2">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="text-[10px] text-[#E8198A] ml-1">{isOpen ? "▲" : "▼"}</span>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute z-[100] w-full bg-white border-2 border-[#E8198A] rounded-xs shadow-2xl max-h-60 flex flex-col ${
            dropUp ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          {/* Search Input */}
          <div className="p-2 border-b border-[#F8BBD0] bg-[#FCE4EC] sticky top-0 z-[101]">
            <input
              type="text"
              autoFocus
              className="w-full text-xs px-2 py-1.5 border border-[#F8BBD0] rounded-xs focus:outline-none focus:border-[#E8198A] focus:ring-1 focus:ring-[#E8198A] bg-white"
              placeholder="Type to search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-48 divide-y divide-slate-100">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`px-3 py-2 text-xs cursor-pointer hover:bg-[#E8198A] hover:text-white transition-colors ${
                    String(value) === String(opt.value) ? "bg-[#FCE4EC] text-[#E8198A] font-bold" : "text-[#16324A]"
                  }`}
                  onClick={() => handleSelect(opt.value)}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="px-3 py-3 text-xs text-slate-400 text-center italic">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
