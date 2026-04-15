import React, { useState, useEffect } from "react";
import { FiChevronDown, FiX } from "react-icons/fi";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "~/components/ui/command";
import { Button } from "~/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { cn } from "~/lib/utils";

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
    const [asyncOptions, setAsyncOptions] = useState<ISelectOption[]>([]);
    const [loading, setLoading] = useState(false);

    const debouncedSearch = useDebounce(search, 300);
    const isAsyncMode = typeof onSearch === "function";
    const selectedOption = staticOptions.find((opt) => String(opt.value) === String(value));
    const displayLabel = selectedLabel || selectedOption?.label || "";
    const renderedOptions = isAsyncMode ? asyncOptions : staticOptions;

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

    function handleSelect(opt: ISelectOption)
    {
        onChange(opt.value, opt.label, opt);
        setIsOpen(false);
        setSearch("");
    }

    function handleClear(e: React.MouseEvent)
    {
        e.stopPropagation();
        onChange("", "", null);
        setSearch("");
    }

    function handleOpenChange(open: boolean)
    {
        if (!open)
        {
            setIsOpen(false);
            setSearch("");
        }
        else
        {
            setIsOpen(true);
        }
    }

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger
                render={<div />}
                className={cn(
                    "relative flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs cursor-pointer transition-[color,box-shadow] outline-none",
                    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                    error && "border-destructive ring-3 ring-destructive/20",
                    disabled && "pointer-events-none cursor-not-allowed opacity-50",
                )}
                style={style}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span className={cn("flex-1 truncate text-left", !displayLabel && "text-muted-foreground")}>
                    {displayLabel || placeholder}
                </span>
                {value && !disabled
                    ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={handleClear}
                            className="ml-1 shrink-0 text-muted-foreground hover:text-foreground"
                            aria-label="Clear selection"
                        >
                            <FiX size={13} />
                        </Button>
                    )
                    : <FiChevronDown size={13} className="ml-1 shrink-0 text-muted-foreground" />
                }
            </PopoverTrigger>
            <PopoverContent className="w-[var(--anchor-width)] p-0" align="start" sideOffset={2}>
                <Command shouldFilter={!isAsyncMode}>
                    <CommandInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder={placeholder}
                    />
                    <CommandList>
                        <CommandEmpty>
                            {loading ? "Loading..." : "No options found."}
                        </CommandEmpty>
                        {!loading && (
                            <CommandGroup>
                                {renderedOptions.map((opt) => (
                                    <CommandItem
                                        key={opt.value}
                                        value={opt.label}
                                        onSelect={() => handleSelect(opt)}
                                    >
                                        {opt.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
