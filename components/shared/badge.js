import { cn } from '@/app/utils/cn';

function Badge({ children, className = 'uppercase' }) {
    const finalClasses = cn(
        'py-1 px-4 text-sm font-semibold rounded-full text-section-color bg-section-bg text-center',
        className
    );

    return <span className={finalClasses}>{children}</span>;
}

export default Badge;
