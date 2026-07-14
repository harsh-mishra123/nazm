"use client";

import { useState, useCallback, useRef } from "react";
import { Search, Loader2, User } from "lucide-react";

interface UserResult {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

interface UserSearchProps {
  onSelect: (user: UserResult) => void;
  placeholder?: string;
}

export function UserSearch({ onSelect, placeholder = "Search by username..." }: UserSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((value: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (!value.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/users/search?q=${encodeURIComponent(value)}`
        );
        const data = await res.json();
        setResults(data.users ?? []);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowResults(true);
    search(value);
  };

  const handleSelect = (user: UserResult) => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    onSelect(user);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          placeholder={placeholder}
          className="w-full rounded-xl bg-muted/30 border border-border/50 pl-9 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
        />
        {isSearching && (
          <Loader2
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"
          />
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-lg overflow-hidden">
          {results.map((user) => (
            <button
              key={user.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(user)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                  <User size={14} className="text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm text-foreground truncate">
                  @{user.username}
                </p>
                {user.displayName && (
                  <p className="text-xs text-muted-foreground truncate">
                    {user.displayName}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && query.trim() && !isSearching && results.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-lg p-4 text-center text-sm text-muted-foreground">
          No users found
        </div>
      )}
    </div>
  );
}
