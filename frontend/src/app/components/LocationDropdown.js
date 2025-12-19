"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { MapPin } from "lucide-react";

export default function LocationDropdown({ value, onChange, placeholder = "Search location" }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    const handler = setTimeout(async () => {
      try {
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();
        const controller = abortRef.current;

        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}`;
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch locations");
        const data = await response.json();

        // ✅ Map and remove duplicates
        const mapped = Array.isArray(data)
          ? [...new Set(data.map((item) => item.display_name))]
          : [];

        setResults(mapped);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Unable to load locations");
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [query]);

  const clearSelection = () => {
    onChange?.("");
    setQuery("");
    setResults([]);
    setError("");
  };

  return (
    <Combobox value={value ?? ""} onChange={(val) => onChange?.(val)}>
      <div className="relative w-full">
        {/* Input Box */}
        <div className="relative w-full cursor-default overflow-hidden rounded-md border border-[#1b2b27] bg-[#0e1513] text-left shadow-sm focus-within:ring-2 focus-within:ring-green-400">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MapPin className="h-4 w-4 text-gray-500" />
          </div>
          <Combobox.Input
            className="w-full border-none py-2.5 pl-9 pr-10 text-sm text-green-300 placeholder-gray-500 bg-transparent focus:ring-0"
            displayValue={(val) => val}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            aria-label="Location"
            autoComplete="off"
          />

          {(value || query) && (
            <button
              type="button"
              aria-label="Clear selected location"
              onClick={clearSelection}
              className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 cursor-pointer hover:text-gray-300"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Dropdown Results */}
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery("")}
        >
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-[#0e1513] py-1 text-sm shadow-lg ring-1 ring-[#1b2b27] focus:outline-none">
            {error ? (
              <div className="relative cursor-default select-none px-3 py-2 text-red-400">
                {error}
              </div>
            ) : loading ? (
              <div className="relative cursor-default select-none px-3 py-2 text-gray-400">
                Loading...
              </div>
            ) : results.length === 0 && query !== "" ? (
              <div className="relative cursor-default select-none px-3 py-2 text-gray-400">
                No results found.
              </div>
            ) : (
              results.map((location, index) => (
                <Combobox.Option
                  key={`${location}-${index}`} // ✅ Unique key fix
                  className={({ active }) =>
                    `relative cursor-default select-none px-3 py-2 ${active ? "bg-[#12201c] text-green-200" : "text-green-300"
                    }`
                  }
                  value={location}
                >
                  {({ selected }) => (
                    <span
                      className={`${selected ? "font-medium" : "font-normal"
                        } block truncate`}
                    >
                      {location}
                    </span>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
}
