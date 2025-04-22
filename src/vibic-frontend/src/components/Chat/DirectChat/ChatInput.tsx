import { Paperclip, Send, Smile } from 'lucide-react';

interface Props {
    inputValue: string;
    setInputValue: (val: string) => void;
    handleSend: () => void;
    handleTyping: () => void;
    placeholder?: string;
}

export default function ChatInput({ inputValue, setInputValue, handleSend, handleTyping, placeholder }: Props) {
    return (
        <div className="h-16 px-4 py-2 border-t border-[#1e1f22] flex items-center gap-3 bg-[#383a40]">
            <button><Paperclip className="w-5 h-5 text-gray-400 hover:text-white" /></button>
            <input
                type="text"
                placeholder={placeholder || 'Сообщение...'}
                className="flex-1 bg-[#1e1f22] rounded-md px-4 py-2 text-sm text-white placeholder-gray-400 outline-none"
                value={inputValue}
                onChange={(e) => {
                    setInputValue(e.target.value);
                    handleTyping();
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} className="hover:text-white text-gray-400">
                <Send className="w-5 h-5" />
            </button>
            <button><Smile className="w-5 h-5 text-gray-400 hover:text-white" /></button>
        </div>
    );
}
