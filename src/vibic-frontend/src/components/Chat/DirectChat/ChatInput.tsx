import { useCallback, useEffect, useRef, useState } from 'react';
import { Paperclip, Reply, Send, Smile, X } from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import MessageResponse from '../../../types/MessageType';
import { ServerMemberResponse } from '../../../types/ServerType';
import { resolveAssetUrl } from '../../../api/httpClient';

interface ChatInputProps {
    inputValue: string;
    setInputValue: (val: string) => void;
    handleSend: (files: File[]) => void | Promise<void>;
    handleTyping: () => void;
    placeholder?: string;
    replyTo?: MessageResponse | null;
    onCancelReply?: () => void;
    serverMembers?: ServerMemberResponse[];
}

interface MentionState {
    query: string;
    atIndex: number;
}

function getMentionState(value: string, cursorPos: number): MentionState | null {
    const textBefore = value.slice(0, cursorPos);
    const match = textBefore.match(/@(\w*)$/);
    if (!match) return null;
    const atIndex = textBefore.lastIndexOf('@');
    const charBefore = atIndex > 0 ? textBefore[atIndex - 1] : ' ';
    if (!/\s/.test(charBefore)) return null;
    return { query: match[1], atIndex };
}

export default function ChatInput({
    inputValue, setInputValue, handleSend, handleTyping,
    placeholder, replyTo, onCancelReply, serverMembers = [],
}: ChatInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const lastCursorRef = useRef<number>(0);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [mention, setMention] = useState<MentionState | null>(null);
    const [mentionIndex, setMentionIndex] = useState(0);

    const mentionResults = mention !== null
        ? serverMembers.filter(m => {
            const q = mention.query.toLowerCase();
            if (!q) return true;
            return m.username.toLowerCase().includes(q) || m.displayName.toLowerCase().includes(q);
        }).slice(0, 8)
        : [];

    useEffect(() => {
        setMentionIndex(0);
    }, [mention?.query]);

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

    const updateMentionState = (value: string) => {
        const el = textareaRef.current;
        const cursor = el?.selectionStart ?? value.length;
        const state = getMentionState(value, cursor);
        setMention(state);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setInputValue(val);
        handleTyping();
        e.target.style.height = 'auto';
        e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
        updateMentionState(val);
    };

    const selectMember = useCallback((member: ServerMemberResponse) => {
        if (!mention) return;
        const before = inputValue.slice(0, mention.atIndex);
        const after = inputValue.slice(mention.atIndex + 1 + mention.query.length);
        const newValue = `${before}@${member.username} ${after}`;
        setInputValue(newValue);
        setMention(null);
        requestAnimationFrame(() => {
            const el = textareaRef.current;
            if (!el) return;
            const newPos = mention.atIndex + member.username.length + 2;
            el.focus();
            el.setSelectionRange(newPos, newPos);
            el.style.height = 'auto';
            el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
        });
    }, [inputValue, mention, setInputValue]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (mention && mentionResults.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setMentionIndex(i => (i + 1) % mentionResults.length);
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setMentionIndex(i => (i - 1 + mentionResults.length) % mentionResults.length);
                return;
            }
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                selectMember(mentionResults[mentionIndex]);
                return;
            }
            if (e.key === 'Escape') {
                setMention(null);
                return;
            }
        }
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendAll();
        }
    };

    const handleSendAll = () => {
        const pending = files.slice();
        setFiles([]);
        setMention(null);
        void handleSend(pending);
    };

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
            {/* @ Mention autocomplete */}
            {mention && mentionResults.length > 0 && (
                <div className="absolute bottom-full mb-2 left-0 right-0 bg-[#171b27] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-slide-up">
                    <div className="px-3 py-1.5 border-b border-white/[0.05]">
                        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#3d4465]">
                            Участники сервера
                        </span>
                    </div>
                    {mentionResults.map((member, i) => (
                        <button
                            key={member.userId}
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); selectMember(member); }}
                            className={`w-full flex items-center gap-3 px-3 py-2 transition-colors text-left ${
                                i === mentionIndex
                                    ? 'bg-[#252c3f] text-white'
                                    : 'text-[#8b90a8] hover:bg-[#1c2032] hover:text-white'
                            }`}
                        >
                            {member.avatarUrl ? (
                                <img
                                    src={resolveAssetUrl(member.avatarUrl)}
                                    alt={member.displayName}
                                    className="w-7 h-7 rounded-full object-cover shrink-0"
                                />
                            ) : (
                                <div className="w-7 h-7 rounded-full bg-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300 shrink-0">
                                    {member.displayName.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="min-w-0">
                                <div className="text-sm font-semibold truncate">{member.displayName}</div>
                                <div className="text-xs text-[#555c78] truncate">@{member.username}</div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {showEmojiPicker && (
                <EmojiPicker
                    onSelect={insertEmoji}
                    onClose={() => setShowEmojiPicker(false)}
                />
            )}
            <div className="flex flex-col bg-[#1c2032] rounded-2xl overflow-hidden border border-white/[0.06] transition-all duration-200 focus-within:border-white/[0.10]">
                {/* Reply preview */}
                {replyTo && (
                    <div className="flex items-center gap-2 px-3 pt-2.5 pb-1.5 border-b border-white/[0.05]">
                        <Reply className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="text-xs font-semibold text-indigo-300 shrink-0">{replyTo.senderUsername}</span>
                        <span className="text-xs text-[#555c78] truncate min-w-0">{replyTo.content.replace(/^%%REPLY\|[^|]+\|[^|]+\|[^%]*%%\n?/, '')}</span>
                        <button
                            type="button"
                            onClick={onCancelReply}
                            className="ml-auto shrink-0 p-0.5 rounded text-[#3d4465] hover:text-white transition-colors"
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
                                    className="h-20 w-20 object-cover rounded-xl border border-white/[0.08]"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeFile(i)}
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#0e1016] border border-white/[0.12] text-[#6b7292] hover:text-white flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Input row */}
                <div className="flex items-end gap-1.5 px-2 py-2">
                    {/* File attach */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="shrink-0 p-1.5 rounded-lg text-[#3d4465] hover:text-white hover:bg-white/[0.07] transition-all duration-150 mb-0.5"
                        title="Прикрепить файл"
                    >
                        <Paperclip className="w-4 h-4" />
                    </button>

                    <textarea
                        ref={textareaRef}
                        rows={1}
                        placeholder={placeholder || 'Сообщение...'}
                        className="flex-1 bg-transparent text-sm text-white placeholder-[#3d4465] outline-none py-1.5 resize-none overflow-hidden leading-[1.5]"
                        value={inputValue}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onFocus={resizeTextarea}
                        onSelect={() => updateMentionState(inputValue)}
                        onClick={() => updateMentionState(inputValue)}
                    />

                    {/* Emoji */}
                    <div className="shrink-0 mb-0.5">
                        <button
                            type="button"
                            onClick={handleEmojiButtonClick}
                            className={`p-1.5 rounded-lg transition-all duration-150 ${
                                showEmojiPicker
                                    ? 'text-indigo-400 bg-indigo-500/10'
                                    : 'text-[#3d4465] hover:text-white hover:bg-white/[0.07]'
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
                        className={`shrink-0 p-1.5 rounded-lg transition-all duration-150 mb-0.5 ${
                            canSend
                                ? 'text-indigo-400 hover:bg-indigo-500/15 hover:text-indigo-300'
                                : 'text-[#2a3048] cursor-not-allowed'
                        }`}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>

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
