import { ReactNode } from 'react';

interface AuthLayoutProps {
    title: string;
    subtitle?: string;
    footer?: ReactNode;
    children: ReactNode;
}

function AuthLayout({ title, subtitle, footer, children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center px-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                    {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
                </div>

                {children}

                {footer && (
                    <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">{footer}</div>
                )}
            </div>

            <footer className="mt-8 text-xs text-gray-400">© 2025 Vibic. All rights reserved.</footer>
        </div>
    );
}

export default AuthLayout;