import { ReactNode } from 'react';

interface AuthLayoutProps {
    title: string;
    subtitle?: string;
    footer?: ReactNode;
    children: ReactNode;
}

function AuthLayout({ title, subtitle, footer, children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-[#1e1f22] flex flex-col justify-center items-center px-4 relative overflow-hidden">
            {/* Ambient blobs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-48 -left-48 w-[500px] h-[500px] rounded-full bg-indigo-600/[0.12] blur-3xl" />
                <div className="absolute -bottom-48 -right-48 w-[500px] h-[500px] rounded-full bg-violet-600/[0.10] blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full bg-indigo-900/[0.08] blur-3xl" />
            </div>

            {/* Card */}
            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2.5 mb-8">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                        <img src="/vibic_logo.svg" alt="Vibic" className="h-6 w-6 object-contain" />
                    </div>
                    <span className="text-2xl font-bold text-white tracking-tight">Vibic</span>
                </div>

                <div className="bg-[#25262b] border border-white/[0.07] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.5)] overflow-hidden">
                    {/* Card header */}
                    <div className="px-8 pt-8 pb-6 border-b border-white/[0.06]">
                        <h1 className="text-xl font-bold text-white">{title}</h1>
                        {subtitle && (
                            <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
                        )}
                    </div>

                    {/* Form area */}
                    <div className="px-8 py-6">
                        {children}
                    </div>

                    {footer && (
                        <div className="px-8 pb-6 text-center text-sm text-gray-500">
                            {footer}
                        </div>
                    )}
                </div>
            </div>

            <p className="mt-8 text-xs text-gray-600">© 2026 Vibic. All rights reserved.</p>
        </div>
    );
}

export default AuthLayout;
