import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';


export default function ServerSidebar() {
    return (
        <div className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-4 gap-4">

            {/* Vibic Logo button */}
            <Link
                to="/channels/@me"
                className="group w-12 h-12 rounded-2xl hover:rounded-3xl hover:bg-[#5865F2]/40 transition-all flex items-center justify-center overflow-hidden"
            >
                <img
                    src="/vibic_logo.svg"
                    alt="Vibic Logo"
                    className="w-7 h-7 object-contain"
                />
            </Link>

            {/* Пример серверов */}
            <div className="w-10 h-10 bg-indigo-500 rounded-2xl transition-all"></div>
            <div className="w-10 h-10 bg-indigo-500 rounded-2xl transition-all"></div>

            <button
                className="w-10 h-10 bg-gray-600 rounded-2xl transition-all text-white hover:rounded-3xl hover:bg-gray-500 flex items-center justify-center"
            >
                <Plus className="w-5 h-5" />
            </button>
        </div>
    );
}
