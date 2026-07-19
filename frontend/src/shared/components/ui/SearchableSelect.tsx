import { useState, useRef, useEffect } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SearchableSelectProps {
  options: SelectOption[]
  value: string
  onChange: (event: { target: { name: string; value: string } }) => void
  placeholder?: string
  className?: string
  name?: string
}

/**
 * A custom searchable dropdown that mimics a native <select> change event
 * so it works seamlessly with React Hook Form's register() API.
 */
export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  name = '',
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find((opt) => opt.value === value)

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opt.value.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSelect = (val: string) => {
    onChange({ target: { name, value: val } })
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div
        className="w-full border border-[#D1D7CE] bg-[#F2F4F1] focus-within:bg-white text-[#16324A] rounded-xs text-xs px-3 py-2 cursor-pointer flex justify-between items-center"
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) setSearchTerm('')
        }}
      >
        <span className="truncate mr-2">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="text-[10px] text-slate-400">▼</span>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#D1D7CE] rounded-xs shadow-lg max-h-60 flex flex-col">
          <div className="p-2 border-b border-[#D1D7CE] bg-[#F9FAF8] sticky top-0">
            <input
              type="text"
              autoFocus
              className="w-full text-xs px-2 py-1.5 border border-[#D1D7CE] rounded-xs focus:outline-none focus:border-[#16324A]"
              placeholder="Type to search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`px-3 py-2 text-xs cursor-pointer hover:bg-[#16324A] hover:text-white transition-colors ${
                    value === opt.value ? 'bg-[#e8ebe5] font-semibold' : ''
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
  )
}
