import React, { useState, useRef } from "react";

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
      className="w-full flex items-center bg-white rounded-lg shadow px-3 py-2 mb-4 sticky top-0 z-10"
      role="search"
      onSubmit={e => { e.preventDefault(); onSearch(query.trim()); }}
    >
      <input
        type="search"
        className="flex-1 bg-transparent outline-none text-base px-2"
        placeholder="Search for styles, brands, or products..."
        value={query}
        onChange={handleChange}
        aria-label="Search products"
        autoComplete="off"
      />
      <button
        type="submit"
        className="ml-2 text-primary-600 font-semibold px-3 py-1 rounded focus:ring"
        aria-label="Submit search"
      >
        Search
      </button>
    </form>
  );
}
