import { useEffect, useRef } from 'react';

export interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export default function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Смещаем меню если оно выходит за края экрана
  const adjustedX = Math.min(x, window.innerWidth - 180);
  const adjustedY = Math.min(y, window.innerHeight - items.length * 36 - 16);

  return (
    <div
      ref={menuRef}
      style={{ position: 'fixed', left: adjustedX, top: adjustedY, zIndex: 9999 }}
      className="bg-[#0f1219] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 py-1.5 min-w-[168px] select-none animate-scale-in"
    >
      {items.map((item, i) =>
        item.label === '---' ? (
          <div key={i} className="my-1.5 mx-2 h-px bg-white/[0.07]" />
        ) : (
          <button
            key={i}
            type="button"
            disabled={item.disabled}
            onClick={() => { item.onClick(); onClose(); }}
            className={`w-full flex items-center gap-2.5 mx-1 px-2.5 py-1.5 text-sm transition-all duration-100 text-left rounded-lg
              ${item.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
              ${item.variant === 'danger'
                ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                : 'text-[#c8cce0] hover:bg-white/[0.07] hover:text-white'
              }`}
          >
            {item.icon && <span className="w-4 h-4 shrink-0 flex items-center justify-center">{item.icon}</span>}
            {item.label}
          </button>
        )
      )}
    </div>
  );
}
