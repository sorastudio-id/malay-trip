'use client'

import { Search } from 'lucide-react'
import { Input } from './ui/input'

interface SearchBarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  placeholder?: string
}

export default function SearchBar({ searchQuery, setSearchQuery, placeholder = "Cari file..." }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
        className="pl-10"
      />
    </div>
  )
}
