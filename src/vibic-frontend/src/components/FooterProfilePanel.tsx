import { Settings, Mic, Headphones } from 'lucide-react';

export default function FooterProfilePanel() {
    return (
        <div className="w-full px-3 py-2 bg-[#1e1f22] flex items-center justify-between text-sm text-white">
            <div className="flex items-center gap-2">
                <img
                    src="https://cdn.discordapp.com/avatars/841703775814942800/9824fc2d85ea569cebc7eab0e6746b45.webp?size=80" // заменишь на свой
                    className="w-8 h-8 rounded-full"
                    alt="avatar"
                />
                <div>
                    <div className="font-semibold">TruePatriot</div>
                    <div className="text-xs text-green-500">Online</div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-gray-400 hover:text-white" />
                <Headphones className="w-5 h-5 text-gray-400 hover:text-white" />
                <Settings className="w-5 h-5  text-gray-400 hover:text-white" />
            </div>
        </div>
    );
}
