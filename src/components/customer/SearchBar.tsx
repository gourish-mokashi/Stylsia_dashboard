import React, { useState, useRef } from "react";
import { Search } from "lucide-react";

export interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(value.trim());
    }, 400);
  };

  return (
    <form
      className="w-full mb-4 sticky top-0 z-10"
      role="search"
      onSubmit={e => { e.preventDefault(); onSearch(query.trim()); }}
    >
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="search"
          className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:bg-white focus:shadow-sm text-base placeholder-gray-500 border-0"
          placeholder="Search for products, brands and more"
          value={query}
          onChange={handleChange}
          aria-label="Search products"
          autoComplete="off"
        />
      </div>
    </form>
  );
}
