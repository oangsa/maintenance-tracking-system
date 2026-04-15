import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FiSearch, FiX } from "react-icons/fi";

interface ISelectOption
{
    value: string | number;
    label: string;
    [key: string]: unknown;
}

interface ISearchableSelectProps
{
    options?: ISelectOption[];
    onSearch?: (query: string) => Promise<ISelectOption[]>;
    value: string | number;
    onChange: (value: string | number, label: string, option: ISelectOption | null) => void;
    placeholder?: string;
    disabled?: boolean;
    style?: React.CSSProperties;
    error?: boolean;
    selectedLabel?: string | null;
}

function useDebounce<T>(value: T, delay: number): T
{
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() =>
    {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function SearchableSelect({
    options: staticOptions = [],
    onSearch,
    value,
    onChange,
    placeholder = "Search...",
    disabled = false,
    style = {},
    error = false,
    selectedLabel = null,
}: ISearchableSelectProps)
{
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
    const [asyncOptions, setAsyncOptions] = useState<ISelectOption[]>([]);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const debouncedSearch = useDebounce(search, 300);
    const isAsyncMode = typeof onSearch === "function";
    const options = isAsyncMode ? asyncOptions : staticOptions;
    const selectedOption = staticOptions.find((opt) => String(opt.value) === String(value));
    const displayLabel = selectedLabel || selectedOption?.label || "";

    useEffect(() =>
    {
        if (!isAsyncMode || !isOpen) return;
        setLoading(true);
        onSearch!(debouncedSearch)
            .then((results) =>
            {
                setAsyncOptions(results || []);
                setLoading(false);
            })
            .catch(() =>
            {
                setAsyncOptions([]);
                setLoading(false);
            });
    }, [debouncedSearch, isOpen, isAsyncMode]);

    const filteredOptions = isAsyncMode
        ? options
        : options.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase()));

    useEffect(() =>
    {
        if (isOpen && containerRef.current)
        {
            const rect = containerRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
        }
    }, [isOpen]);

    useEffect(() =>
    {
        if (!isOpen) return;
        const updatePosition = () =>
        {
            if (containerRef.current)
            {
                const rect = containerRef.current.getBoundingClientRect();
                setDropdownPos({
                    top: rect.bottom + window.scrollY + 4,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                });
            }
        };
        window.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition);
        return () =>
        {
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [isOpen]);

    useEffect(() =>
    {
        const handleClickOutside = (e: MouseEvent) =>
        {
            if (containerRef.current && !containerRef.current.contains(e.target as Node))
            {
                const dropdown = document.getElementById("searchable-select-dropdown");
                if (dropdown && dropdown.contains(e.target as Node)) return;
                setIsOpen(false);
                setSearch("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handleSelect(opt: ISelectOption)
    {
        onChange(opt.value, opt.label, opt);
        setIsOpen(false);
        setSearch("");
    }

    function handleFocus()
    {
        if (!disabled)
        {
            setIsOpen(true);
            setSearch("");
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>)
    {
        if (e.key === "Escape")
        {
            setIsOpen(false);
            setSearch("");
            inputRef.current?.blur();
        }
        else if (e.key === "Enter" && filteredOptions.length > 0)
        {
            e.preventDefault();
            handleSelect(filteredOptions[0]);
        }
    }

    function handleClear(e: React.MouseEvent)
    {
        e.stopPropagation();
        onChange("", "", null);
        setSearch("");
        inputRef.current?.focus();
    }

    const containerStyle: React.CSSProperties = { position: "relative", width: "100%", ...style };

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "8px 32px 8px 12px",
        fontSize: "0.9rem",
        border: `1px solid ${error ? "#ef4444" : "var(--border)"}`,
        borderRadius: "var(--radius-sm)",
        background: disabled ? "var(--bg-body)" : "var(--bg-surface)",
        cursor: disabled ? "not-allowed" : "text",
        boxShadow: error ? "0 0 0 1px #ef4444" : undefined,
        outline: "none",
    };

    const dropdownStyle: React.CSSProperties = {
        position: "absolute",
        top: dropdownPos.top,
        left: dropdownPos.left,
        width: dropdownPos.width,
        background: "#fff",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        boxShadow: "var(--shadow-lg)",
        maxHeight: 220,
        overflowY: "auto",
        zIndex: 99999,
    };

    const optionStyle: React.CSSProperties = {
        padding: "10px 12px",
        cursor: "pointer",
        fontSize: "0.9rem",
        borderBottom: "1px solid var(--border)",
        background: "#fff",
    };

    const clearBtnStyle: React.CSSProperties = {
        position: "absolute",
        right: 8,
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 4,
        color: "#999",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    };

    const dropdownPortal = isOpen
        ? createPortal(
            <div id="searchable-select-dropdown" style={dropdownStyle}>
                {loading
                    ? (
                        <div style={{ padding: "12px", color: "#999", textAlign: "center", fontSize: "0.85rem" }}>
                            Loading...
                        </div>
                    )
                    : filteredOptions.length === 0
                        ? (
                            <div style={{ padding: "12px", color: "#999", textAlign: "center", fontSize: "0.85rem" }}>
                                {search ? "No results found" : "Type to search..."}
                            </div>
                        )
                        : filteredOptions.map((opt) => (
                            <div
                                key={opt.value}
                                onClick={() => handleSelect(opt)}
                                style={optionStyle}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-body)")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                            >
                                {opt.label}
                            </div>
                        ))
                }
            </div>,
            document.body
        )
        : null;

    return (
        <div ref={containerRef} style={containerStyle}>
            <div style={{ position: "relative" }}>
                <input
                    ref={inputRef}
                    type="text"
                    value={isOpen ? search : displayLabel}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    style={inputStyle}
                />
                {value && !disabled
                    ? (
                        <button type="button" onClick={handleClear} style={clearBtnStyle} title="Clear">
                            <FiX size={14} />
                        </button>
                    )
                    : (
                        <span style={{ ...clearBtnStyle, cursor: "default", color: "#bbb" }}>
                            <FiSearch size={14} />
                        </span>
                    )
                }
            </div>
            {dropdownPortal}
        </div>
    );
}
