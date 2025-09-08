// src/components/multi-select.tsx

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
    CheckIcon,
    XCircle,
    ChevronDown,
    XIcon,
    WandSparkles,
} from "lucide-react";

import { cn } from "../../lib/utils";
import { Separator } from "../../components/ui/separator";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../../components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "../../components/ui/command";

/**
 * Variants for the multi-select component to handle different styles.
 * Uses class-variance-authority (cva) to define different styles based on "variant" prop.
 */
const multiSelectVariants = cva(
    "m-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300",
    {
        variants: {
            variant: {
                default:
                    "border-foreground/10 text-foreground bg-card hover:bg-card/80",
                secondary:
                    "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                inverted: "inverted",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

/**
 * Props for MultiSelect component
 */
interface MultiSelectProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof multiSelectVariants> {
    /**
     * An array of option objects to be displayed in the multi-select component.
     * Each option object has a label, value, and an optional icon.
     */
    extraData?: {
        role?: { id: string; name: string; label?: string }[];
        section?: { id: string; name: string; label: string }[];
    };

    /**
     * Callback function triggered when the selected values change.
     * Receives an array of the new selected values.
     */
    onValueChange: (value: string[]) => void;

    /** The default selected values when the component mounts. */
    defaultValue?: string[];

    /**
     * Placeholder text to be displayed when no values are selected.
     * Optional, defaults to "Select options".
     */
    placeholder?: string;

    /**
     * Animation duration in seconds for the visual effects (e.g., bouncing badges).
     * Optional, defaults to 0 (no animation).
     */
    animation?: number;

    /**
     * Maximum number of items to display. Extra selected items will be summarized.
     * Optional, defaults to 3.
     */
    maxCount?: number;

    /**
     * The modality of the popover. When set to true, interaction with outside elements
     * will be disabled and only popover content will be visible to screen readers.
     * Optional, defaults to false.
     */
    modalPopover?: boolean;

    /**
     * If true, renders the multi-select component as a child of another component.
     * Optional, defaults to false.
     */
    asChild?: boolean;

    /**
     * Additional class names to apply custom styles to the multi-select component.
     * Optional, can be used to add custom styles.
     */
    className?: string;

    /**
     * If true, the multi-select component will be read-only.
     * Optional, defaults to false.
     */
    readOnly?: boolean;
}

export const MultiSelect = React.forwardRef<
    HTMLButtonElement,
    MultiSelectProps
>(
    (
        {
            extraData,
            onValueChange,
            variant,
            defaultValue = [],
            placeholder = "Select options",
            animation = 0,
            maxCount = 3,
            modalPopover = false,
            className,
            readOnly = false,
            ...props
        },
        ref
    ) => {
        const [selectedValues, setSelectedValues] =
            React.useState<string[]>(defaultValue);
        const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
        const [isAnimating, setIsAnimating] = React.useState(false);

        React.useEffect(() => {
            setSelectedValues(defaultValue);
        }, [defaultValue]);

        const handleInputKeyDown = (
            event: React.KeyboardEvent<HTMLInputElement>
        ) => {
            if (readOnly) return; // Disable input when readOnly
            if (event.key === "Enter") {
                setIsPopoverOpen(true);
            } else if (event.key === "Backspace" && !event.currentTarget.value) {
                const newSelectedValues = [...selectedValues];
                newSelectedValues.pop();
                setSelectedValues(newSelectedValues);
                onValueChange(newSelectedValues);
            }
        };

        const toggleOption = (option: string) => {
            if (readOnly) return; // Disable toggling when readOnly
            const newSelectedValues = selectedValues.includes(option)
                ? selectedValues.filter((value) => value !== option)
                : [...selectedValues, option];
            setSelectedValues(newSelectedValues);
            onValueChange(newSelectedValues);
        };

        const handleClear = () => {
            if (readOnly) return; // Disable clearing when readOnly
            setSelectedValues([]);
            onValueChange([]);
        };

        const handleTogglePopover = () => {
            if (readOnly) return; // Disable toggling popover when readOnly
            setIsPopoverOpen((prev) => !prev);
        };

        const clearExtraOptions = () => {
            if (readOnly) return; // Disable clearing extra options when readOnly
            const newSelectedValues = selectedValues.slice(0, maxCount);
            setSelectedValues(newSelectedValues);
            onValueChange(newSelectedValues);
        };

        const toggleAll = () => {
            if (readOnly) return; // Disable toggling all when readOnly
            if (Array.isArray(extraData?.role) && selectedValues.length === extraData?.role.length) {
                handleClear();
            } else if (Array.isArray(extraData?.role)) {
                const allValues: string[] = extraData?.role.map((option: { id: string }) => option.id);
                setSelectedValues(allValues);
                onValueChange(allValues);
            }
        };

        const optionsToDisplay = Array.isArray(extraData?.role) ? extraData.role.map(role => ({ label: role.label || role.name, value: role.name })) : [];

        return (
            <Popover
                open={isPopoverOpen && !readOnly}
                onOpenChange={setIsPopoverOpen}
                modal={modalPopover}
            >
                <PopoverTrigger asChild>
                    <Button
                        ref={ref}
                        {...props}
                        onClick={handleTogglePopover}
                        className={cn(
                            "flex w-full p-1 rounded-md border min-h-10 h-auto items-center justify-between bg-inherit hover:bg-inherit [&_svg]:pointer-events-auto",
                            className,
                            readOnly && "pointer-events-none opacity-50"
                        )}
                    >
                        {selectedValues.length > 0 ? (
                            <div className="flex justify-between items-center w-full">
                                <div className="flex flex-wrap items-center">
                                    {selectedValues.slice(0, maxCount).map((value) => {
                                        const option: {
                                            label: string;
                                            value: string;
                                            icon?: React.ComponentType<{ className?: string }>;
                                        } | undefined = optionsToDisplay.find((o: { value: string }) => o.value === value);
                                        const IconComponent = option?.icon;
                                        return (
                                            <Badge
                                                key={value}
                                                className={cn(
                                                    readOnly ? "bg-blue-100 text-blue-800 border-blue-300" : "bg-green-700 text-white",
                                                    isAnimating ? "animate-bounce" : "",
                                                    multiSelectVariants({ variant })
                                                )}
                                                style={{ animationDuration: `${animation}s` }}
                                            >
                                                {IconComponent && (
                                                    <IconComponent className="h-4 w-4 mr-2" />
                                                )}
                                                {option?.label}
                                                {!readOnly && (
                                                    <XCircle
                                                        className="ml-2 h-4 w-4 cursor-pointer"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            toggleOption(value);
                                                        }}
                                                    />
                                                )}
                                            </Badge>
                                        );
                                    })}
                                    {selectedValues.length > maxCount && (
                                        <Badge
                                            className={cn(
                                                readOnly ? "bg-gray-100 text-gray-700 border-gray-300" : "bg-white text-foreground border-foreground/10 hover:bg-white",
                                                isAnimating ? "animate-bounce" : "",
                                                multiSelectVariants({ variant })
                                            )}
                                            style={{ animationDuration: `${animation}s` }}
                                        >
                                            {`+ ${selectedValues.length - maxCount} more`}
                                            {!readOnly && (
                                                <XCircle
                                                    className="ml-2 h-4 w-4 cursor-pointer"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        clearExtraOptions();
                                                    }}
                                                />
                                            )}
                                        </Badge>
                                    )}
                                </div>
                                {!readOnly && (
                                    <div className="flex items-center justify-between">
                                        <XIcon
                                            className="h-4 mx-2 cursor-pointer text-muted-foreground"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleClear();
                                            }}
                                        />
                                        <Separator
                                            orientation="vertical"
                                            className="flex min-h-6 h-full"
                                        />
                                        <ChevronDown className="h-4 mx-2 cursor-pointer text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between w-full mx-auto">
                                <span className="text-sm text-muted-foreground mx-3">
                                    {placeholder}
                                </span>
                                {!readOnly && (
                                    <ChevronDown className="h-4 cursor-pointer text-muted-foreground mx-2" />
                                )}
                            </div>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-auto p-0"
                    align="start"
                    onEscapeKeyDown={() => setIsPopoverOpen(false)}
                >
                    <Command>
                        <CommandInput
                            placeholder="Search..."
                            onKeyDown={handleInputKeyDown}
                        />
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup>
                                <CommandItem
                                    key="all"
                                    onSelect={toggleAll}
                                    className="cursor-pointer"
                                >
                                    <div
                                        className={cn(
                                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                            Array.isArray(extraData?.role) && selectedValues.length === extraData?.role.length
                                                ? "bg-primary text-primary-foreground"
                                                : "opacity-50 [&_svg]:invisible"
                                        )}
                                    >
                                        <CheckIcon className="h-4 w-4" />
                                    </div>
                                    <span>(Select All)</span>
                                </CommandItem>
                                {optionsToDisplay.map((option: {
                                    label: string;
                                    value: string;
                                    icon?: React.ComponentType<{ className?: string }>;
                                }) => {
                                    const isSelected: boolean = selectedValues.includes(option.value);
                                    return (
                                        <CommandItem
                                            key={option.value}
                                            onSelect={() => toggleOption(option.value)}
                                            className="cursor-pointer"
                                        >
                                            <div
                                                className={cn(
                                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                    isSelected
                                                        ? "bg-primary text-primary-foreground"
                                                        : "opacity-50 [&_svg]:invisible"
                                                )}
                                            >
                                                <CheckIcon className="h-4 w-4" />
                                            </div>
                                            {option.icon && (
                                                <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                                            )}
                                            <span>{option.label}</span>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                            <CommandSeparator />
                            <CommandGroup>
                                <div className="flex items-center justify-between">
                                    {selectedValues.length > 0 && (
                                        <>
                                            <CommandItem
                                                onSelect={handleClear}
                                                className="flex-1 justify-center cursor-pointer"
                                            >
                                                Clear
                                            </CommandItem>
                                            <Separator
                                                orientation="vertical"
                                                className="flex min-h-6 h-full"
                                            />
                                        </>
                                    )}
                                    <CommandItem
                                        onSelect={() => setIsPopoverOpen(false)}
                                        className="flex-1 justify-center cursor-pointer max-w-full"
                                    >
                                        Close
                                    </CommandItem>
                                </div>
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
                {animation > 0 && selectedValues.length > 0 && (
                    <WandSparkles
                        className={cn(
                            "cursor-pointer my-2 text-foreground bg-background w-3 h-3",
                            isAnimating ? "" : "text-muted-foreground"
                        )}
                        onClick={() => setIsAnimating(!isAnimating)}
                    />
                )}
            </Popover>
        );
    }
);

MultiSelect.displayName = "MultiSelect";