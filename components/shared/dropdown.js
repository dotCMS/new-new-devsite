import { useState, useRef } from 'react';

/**
 * Dropdown component that allows users to select an item from a list.
 *
 * @component
 * @param {Object} props - The properties object.
 * @param {Array<string>} props.items - The list of items to display in the dropdown.
 * @param {string} props.label - The label to display when no item is selected.
 * @param {function} props.onSelect - The callback function to call when an item is selected.
 *
 * @returns {JSX.Element} The rendered dropdown component.
 */
export default function Dropdown({ items, label, onSelect }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleSelect = (item) => {
        // If the selected item is 'All', set it to null to "remove" the filter in query
        const selected = item === 'All' ? null : item;

        onSelect(selected);
        setSelectedItem(selected);
        setIsOpen(false);
    };

    return (
        <div className="relative z-10 inline-block text-left text-blue-700" ref={dropdownRef}>
            <button
                className="inline-flex min-h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 focus:outline-none"
                onClick={toggleDropdown}>
                {selectedItem ? selectedItem : label}
                <svg
                    className="-mr-1 ml-2 size-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute left-0 z-10 mt-2 w-full origin-top-right rounded-md border border-gray-200 bg-white shadow-lg">
                    <ul className="py-1">
                        {['All', ...items].map((item, index) => (
                            <li
                                key={index}
                                className={`cursor-pointer px-4 py-2 text-sm hover:bg-gray-100 ${item === selectedItem ? 'bg-gray-100' : ''}`}
                                onClick={() => handleSelect(item)}>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
