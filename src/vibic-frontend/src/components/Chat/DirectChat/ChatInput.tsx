import { useCallback, useEffect, useRef, useState } from 'react';
import { Paperclip, Reply, Send, Smile, X } from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import MessageResponse from '../../../types/MessageType';

interface ChatInputProps {
    inputValue: string;
    setInputValue: (val: string) => void;
    handleSend: (files: File[]) => void | Promise<void>;
    handleTyping: () => void;
    placeholder?: string;
    replyTo?: MessageResponse | null;
    onCancelReply?: () => void;
}

export default function ChatInput({ inputValue, setInputValue, handleSend, handleTyping, placeholder, replyTo, onCancelReply }: ChatInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const lastCursorRef = useRef<number>(0);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    // Reset height when parent clears the value (after send)
    useEffect(() => {
        if (inputValue === '' && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    }, [inputValue]);

    const resizeTextarea = () => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
        handleTyping();
        e.target.style.height = 'auto';
        e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendAll();
        }
    };

    const handleSendAll = () => {
        const pending = files.slice();
        setFiles([]);
        void handleSend(pending);
    };

    // ── Emoji picker ──────────────────────────────────────────────────────────

    const handleEmojiButtonClick = () => {
        if (textareaRef.current) {
            lastCursorRef.current = textareaRef.current.selectionStart ?? inputValue.length;
        }
        setShowEmojiPicker(v => !v);
    };

    const insertEmoji = useCallback((emoji: string) => {
        const pos = lastCursorRef.current;
        const newValue = inputValue.slice(0, pos) + emoji + inputValue.slice(pos);
        setInputValue(newValue);
        lastCursorRef.current = pos + emoji.length;
        setShowEmojiPicker(false);

        requestAnimationFrame(() => {
            const el = textareaRef.current;
            if (!el) return;
            el.focus();
            const newPos = pos + emoji.length;
            el.setSelectionRange(newPos, newPos);
            el.style.height = 'auto';
            el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
        });
    }, [inputValue, setInputValue]);

    // ── File picker ───────────────────────────────────────────────────────────

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files ?? []);
        setFiles(prev => [...prev, ...selected]);
        e.target.value = '';
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const canSend = inputValue.trim() || files.length > 0;

    return (
        <div className="relative">
        {showEmojiPicker && (
            <EmojiPicker
                onSelect={insertEmoji}
                onClose={() => setShowEmojiPicker(false)}
            />
        )}
        <div className="flex flex-col bg-[#383a40] rounded-2xl overflow-hidden">
            {/* Reply preview */}
            {replyTo && (
                <div className="flex items-center gap-2 px-3 pt-2.5 pb-1.5 border-b border-white/10">
                    <Reply className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="text-xs font-semibold text-indigo-300 shrink-0">{replyTo.senderUsername}</span>
                    <span className="text-xs text-gray-400 truncate min-w-0">{replyTo.content.replace(/^%%REPLY\|[^|]+\|[^|]+\|[^%]*%%\n?/, '')}</span>
                    <button
                        type="button"
                        onClick={onCancelReply}
                        className="ml-auto shrink-0 p-0.5 rounded text-gray-500 hover:text-white transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Image previews */}
            {files.length > 0 && (
                <div className="flex flex-wrap gap-2 px-3 pt-2.5 pb-1">
                    {files.map((file, i) => (
                        <div key={i} className="relative group">
                            <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="h-20 w-20 object-cover rounded-lg border border-white/10"
                            />
                            <button
                                type="button"
                                onClick={() => removeFile(i)}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#1e1f22] border border-white/20 text-gray-400 hover:text-white flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Input row */}
            <div className="flex items-end gap-2 px-3 py-2">
                {/* File attach */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors mb-0.5"
                    title="Прикрепить файл"
                >
                    <Paperclip className="w-4 h-4" />
                </button>

                <textarea
                    ref={textareaRef}
                    rows={1}
                    placeholder={placeholder || 'Сообщение...'}
                    className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none py-1 resize-none overflow-hidden leading-[1.4]"
                    value={inputValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onFocus={resizeTextarea}
                />

                {/* Emoji */}
                <div className="shrink-0 mb-0.5">
                    <button
                        type="button"
                        onClick={handleEmojiButtonClick}
                        className={`p-1.5 rounded-lg transition-colors ${
                            showEmojiPicker
                                ? 'text-indigo-400 bg-indigo-500/10'
                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                        title="Эмодзи"
                    >
                        <Smile className="w-4 h-4" />
                    </button>
                </div>

                {/* Send */}
                <button
                    type="button"
                    onClick={handleSendAll}
                    disabled={!canSend}
                    className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors mb-0.5"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />
        </div>
        </div>
    );
}
