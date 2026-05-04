import { ReactNode } from 'react';

interface AuthLayoutProps {
    title: string;
    subtitle?: string;
    footer?: ReactNode;
    children: ReactNode;
}

function AuthLayout({ title, subtitle, footer, children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-[#0e1016] flex flex-col justify-center items-center px-4 relative overflow-hidden">
            {/* Background — deep ambient light */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-72 -left-72 w-[700px] h-[700px] rounded-full bg-indigo-700/[0.07] blur-[130px]" />
                <div className="absolute -bottom-72 -right-72 w-[700px] h-[700px] rounded-full bg-violet-800/[0.06] blur-[130px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-indigo-950/[0.3] blur-[80px]" />
                {/* Subtle grid */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `linear-gradient(rgba(99,102,241,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.035) 1px, transparent 1px)`,
                        backgroundSize: '48px 48px',
                    }}
                />
                {/* Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(9,9,15,0.7)_100%)]" />
            </div>

            {/* Card */}
            <div className="relative w-full max-w-md animate-fade-slide-up">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-[14px] bg-indigo-600/20 border border-indigo-500/25 flex items-center justify-center shadow-xl shadow-indigo-950/50">
                        <img src="/vibic_logo.svg" alt="Vibic" className="h-5 w-5 object-contain" />
                    </div>
                    <span className="text-2xl font-bold text-white tracking-tight">Vibic</span>
                </div>

                <div className="bg-[#13161f] border border-white/[0.07] rounded-2xl shadow-[0_32px_96px_rgba(0,0,0,0.65)] overflow-hidden">
                    {/* Accent line at top */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

                    {/* Card header */}
                    <div className="px-8 pt-7 pb-5 border-b border-white/[0.05]">
                        <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
                        {subtitle && (
                            <p className="text-sm text-[#6b7292] mt-1">{subtitle}</p>
                        )}
                    </div>

                    {/* Form area */}
                    <div className="px-8 py-6">
                        {children}
                    </div>

                    {footer && (
                        <div className="px-8 pb-6 text-center text-sm text-[#555c78]">
                            {footer}
                        </div>
                    )}
                </div>
            </div>

            <p className="mt-8 text-xs text-[#2e3455]">© 2026 Vibic.</p>
        </div>
    );
}

export default AuthLayout;
