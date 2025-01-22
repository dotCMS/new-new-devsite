import { cn } from '@/app/utils/cn';
import { IconCircleChevronRight } from '@tabler/icons-react';
import Link from 'next/link';

function PrimaryButton({ url, title, children, className }) {
    const twClasses = cn('btn btn-dark text-white hover:text-blue hover:bg-white');
    const twDark = cn(
        `dark:btn-light dark:text-blue-700 dark:btn-light-chevron dark:hover:border-white dark:hover:bg-black dark:hover:text-white`
    );

    return (
        <Link
            href={url}
            role="button"
            className={`${twClasses} ${twDark} ${className}`}
            aria-label={title}>
            {children ?? title}
            <IconCircleChevronRight size={24} className="mr-2" />
        </Link>
    );
}

function SecondaryButton({ url, title, children, className }) {
    const twClasses = cn(
        `btn border-indigo-700 bg-indigo-700 text-white hover:border-indigo-700 hover:text-indigo-700 hover:bg-white`
    );

    const twDark = cn(
        `dark:text-indigo-700 dark:border-white dark:bg-white dark:hover:bg-indigo-700 dark:hover:text-white`
    );

    return (
        <Link
            href={url}
            role="button"
            className={`${twClasses} ${twDark} ${className}`}
            aria-label={title}>
            {children ?? title}
            <IconCircleChevronRight size={24} className="mr-2" />
        </Link>
    );
}

export function LinkButton({ url, title, children, className }) {
    const twClasses = cn(
        `text-blue-700 bg-transparent border-blue-700 w-fit btn dark:text-blue-700 hover:bg-blue-700 hover:text-white`
    );
    const twDark = cn(
        `dark:text-white dark:border-white dark:hover:bg-white dark:hover:text-blue-700`
    );

    return (
        <Link
            href={url}
            role="button"
            className={`${twClasses} ${twDark} ${className}`}
            aria-label={title}>
            {children ?? title}
        </Link>
    );
}

export function CallToActionButton({ buttonType, children, className, ...props }) {
    const buttons = {
        primary: PrimaryButton,
        secondary: SecondaryButton,
        link: LinkButton
    };

    const Button = buttons[buttonType] ?? PrimaryButton;
    const commonClasses = cn(
        `flex gap-2 justify-center items-center w-fit border border-2 border-solid transition-colors duration-300`
    );

    return (
        <Button {...props} className={`${commonClasses} ${className}`}>
            {children}
        </Button>
    );
}
