"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Dropdown component that allows users to select an item from a list.
 *
 * @component
 * @param {Object} props - The properties object.
 * @param {Array<string>} props.items - The list of items to display in the dropdown.
 * @param {string} props.label - The label to display when no item is selected.
 * @param {function} props.onSelect - The callback function to call when an item is selected.
 * @param {boolean} props.includeAll - If true, start dropdown with 'All' option.
 *
 * @returns {JSX.Element} The rendered dropdown component.
 */
export default function Dropdown({ items, label, onSelect, includeAll=false }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleSelect = (item) => {
        // If the selected item is 'All', set it to null to "remove" the filter in query
        const selected = item === 'All' ? null : item;

        onSelect(selected);
        setSelectedItem(selected);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium 
                    bg-background border border-input hover:bg-accent hover:text-accent-foreground
                    transition-colors">
                {selectedItem ? selectedItem : label}
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
                <div className="absolute z-50 mt-2 w-48 rounded-md shadow-lg">
                    <div className="rounded-md ring-1 ring-black ring-opacity-5 bg-background border border-input">
                        <div className="py-1">
                            {(includeAll ? ['All', ...items] : [...items]).map((item) => (
                                <button
                                    key={item}
                                    onClick={() => handleSelect(item)}
                                    className="block w-full text-left px-4 py-2 text-sm
                                        hover:bg-accent hover:text-accent-foreground
                                        transition-colors">
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
