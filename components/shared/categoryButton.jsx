import React from 'react';
import { cn } from '@/app/utils/cn';

function CategoryButton({ children, onClick = () => {}, active = false }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'px-4 py-2 rounded-lg text-base font-medium w-fit',
                active ? 'bg-fuschia-700 text-white' : 'bg-blue-100 text-blue-700',
                'hover:bg-fuschia-700 hover:text-white'
            )}>
            {children}
        </button>
    );
}

export default CategoryButton;
