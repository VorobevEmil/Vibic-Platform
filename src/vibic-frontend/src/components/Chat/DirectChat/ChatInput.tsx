import { Paperclip, Send, Smile } from 'lucide-react';

interface ChatInputProps {
    inputValue: string;
    setInputValue: (val: string) => void;
    handleSend: () => void;
    handleTyping: () => void;
    placeholder?: string;
}

export default function ChatInput({ inputValue, setInputValue, handleSend, handleTyping, placeholder }: ChatInputProps) {
    return (
        <div className="flex items-center gap-2 bg-[#383a40] rounded-2xl px-3 py-2">
            <button className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                <Paperclip className="w-4 h-4" />
            </button>

            <input
                type="text"
                placeholder={placeholder || 'Сообщение...'}
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none py-1"
                value={inputValue}
                onChange={(e) => {
                    setInputValue(e.target.value);
                    handleTyping();
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />

            <button className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                <Smile className="w-4 h-4" />
            </button>

            <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
                <Send className="w-4 h-4" />
            </button>
        </div>
    );
}
