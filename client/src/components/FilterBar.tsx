import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/store/uiStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function FilterBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchQuery, setSearchQuery } = useUiStore();
  
  // Local state for instant input feedback
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [debouncedSearch] = useDebounce(localSearch, 300);

  // Sync debounced local search with global Zustand store
  useEffect(() => {
    setSearchQuery(debouncedSearch);
  }, [debouncedSearch, setSearchQuery]);

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setLocalSearch("");
    setSearchQuery("");
  };

  const hasFilters = searchParams.has("status") || searchParams.has("priority") || localSearch.length > 0;

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full bg-card/30 p-4 rounded-xl border border-border backdrop-blur-sm mb-6 shadow-sm">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-9 bg-background/50 border-border"
        />
        {localSearch && (
          <button 
            onClick={() => setLocalSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground hidden sm:block" />
        
        <Select 
          value={searchParams.get("status") || "all"} 
          onValueChange={(val) => handleFilterChange("status", val)}
        >
          <SelectTrigger className="w-[140px] bg-background/50 border-border">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={searchParams.get("priority") || "all"} 
          onValueChange={(val) => handleFilterChange("priority", val)}
        >
          <SelectTrigger className="w-[140px] bg-background/50 border-border">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="px-2 h-9">
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
