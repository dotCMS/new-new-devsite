import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { cn } from '@/app/utils/cn';

import { IconCircleChevronRight } from '@tabler/icons-react';
import { Toast } from '../toast';

const ERRORS_MESSAGES = {
    name: 'Name is required.',
    email: 'A valid email is required.'
};

export const NewsletterForm = () => {
    const router = useRouter();

    const [formData, setFormData] = useState({ name: '', email: '' });
    const [errors, setErrors] = useState({ name: '', email: '' });
    const [showErrorToast, setShowErrorToast] = useState(false);
    const [pending, setPending] = useState(false);

    const handleChange = ({ target }) => {
        const { name, value } = target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleBlur = ({ target }) => {
        if (target.checkValidity()) {
            return;
        }

        const { name } = target;
        setErrors((prev) => ({ ...prev, [name]: ERRORS_MESSAGES[name] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!e.target.checkValidity()) {
            return;
        }

        setPending(true);
        const data = {
            fields: [
                { name: 'firstname', value: formData.name },
                { name: 'email', value: formData.email }
            ]
        };

        try {
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Submission failed');
            }

            const { redirectUri } = await response.json();
            const { pathname } = new URL(redirectUri);

            router.push(pathname);
        } catch (error) {
            setShowErrorToast(true);
        } finally {
            setPending(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 rounded-2xl bg-indigo-200 p-8">
            <div className="flex flex-col gap-2">
                <h3 className="text-blue-700">
                    Join Over <span className="text-fuschia-700">10,000</span> Subscribers
                </h3>
                <p className="text-blue-600">Get the latest blogs, webinars, and white papers.</p>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <Input
                    name="name"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    errorMessage={errors.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                />

                <Input
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    errorMessage={errors.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                />

                <button
                    type="submit"
                    className="flex w-fit items-center gap-4 rounded-lg border-2 border-blue-700 px-6 py-4 text-blue-700 transition-colors duration-300 hover:border-fuschia-500 hover:bg-fuschia-500 hover:text-white disabled:opacity-50"
                    disabled={pending}>
                    {pending ? 'Submitting' : 'Subscribe'}
                    <IconCircleChevronRight size={24} />
                </button>
            </form>
            <Toast
                title="Oops!"
                show={showErrorToast}
                className="border-red-500"
                description="There was an error submitting the form. Please try again or contact us."
                handleClose={() => setShowErrorToast(false)}
            />
        </div>
    );
};

const Input = ({ name, type, placeholder, errorMessage, value, onChange, onBlur }) => {
    const twClasses = cn('px-2 w-full rounded-lg h-[3.75rem] text-blue-700 border');

    return (
        <div>
            <input
                required
                type={type}
                name={name}
                value={value}
                placeholder={placeholder}
                onChange={onChange}
                onBlur={onBlur}
                aria-invalid={!!errorMessage}
                aria-describedby={`${name}-error`}
                className={`${twClasses} ${errorMessage ? 'border-red-500' : ''}`}
            />
            {errorMessage && (
                <span id={`${name}-error`} className="text-xs text-red-500">
                    {errorMessage}
                </span>
            )}
        </div>
    );
};
