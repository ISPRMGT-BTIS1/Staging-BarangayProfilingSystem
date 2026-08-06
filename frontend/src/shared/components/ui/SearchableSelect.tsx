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
  const [dropUp, setDropUp] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const toggleOpen = () => {
    if (!isOpen && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      setDropUp(spaceBelow < 260)
      setSearchTerm('')
    }
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find((opt) => String(opt.value) === String(value))

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(opt.value).toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSelect = (val: string) => {
    onChange({ target: { name, value: val } })
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div
        className="w-full border border-[#F4C2D7] bg-[#FDF4F8] focus-within:bg-white text-[#2D3748] rounded-md text-xs px-3 py-2 cursor-pointer flex justify-between items-center focus-within:border-[#D86B98] focus-within:ring-1 focus-within:ring-[#D86B98]"
        onClick={toggleOpen}
      >
        <span className="truncate mr-2">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="text-[10px] text-[#D86B98] ml-1">{isOpen ? '▲' : '▼'}</span>
      </div>

      {isOpen && (
        <div
          className={`absolute z-[100] w-full bg-white border-2 border-[#D86B98] rounded-md shadow-xl max-h-60 flex flex-col ${
            dropUp ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          <div className="p-2 border-b border-[#F4C2D7] bg-[#FDF0F5] sticky top-0 z-[101]">
            <input
              type="text"
              autoFocus
              className="w-full text-xs px-2 py-1.5 border border-[#F4C2D7] rounded-md focus:outline-none focus:border-[#D86B98] focus:ring-1 focus:ring-[#D86B98] bg-white"
              placeholder="Type to search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="overflow-y-auto max-h-48 divide-y divide-slate-100">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`px-3 py-2 text-xs cursor-pointer hover:bg-[#D86B98] hover:text-white transition-colors ${
                    String(value) === String(opt.value) ? 'bg-[#FDF0F5] text-[#D86B98] font-bold' : 'text-[#2D3748]'
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
