import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';

const CATEGORIES = [
  {
    icon: '😀',
    label: 'Смайлики',
    emojis: [
      '😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇',
      '🥰','😍','🤩','😘','😗','😙','🙂','🤗','🤔','😐',
      '😶','🫠','😏','😒','🙄','😬','😔','😪','😴','😷',
      '🤒','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','😳',
      '🥺','🥹','😦','😨','😰','😥','😢','😭','😱','😣',
      '😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀',
      '☠️','💩','🤡','👻','👽','👾','🤖',
    ],
  },
  {
    icon: '👋',
    label: 'Жесты',
    emojis: [
      '👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞',
      '🫰','🤟','🤘','🤙','👈','👉','👆','☝️','🫵','👇',
      '👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲',
      '🙏','✍️','💅','🤳','💪','🦾','🫶','🤝','🫳','🫴',
    ],
  },
  {
    icon: '❤️',
    label: 'Символы',
    emojis: [
      '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','❤️‍🔥',
      '💔','💕','💞','💓','💗','💖','💘','💝','💟','♾️',
      '💯','✅','❌','⚠️','🚫','🔥','✨','💥','⭐','🌟',
      '💫','🎉','🎊','🏆','🥇','🎯','💎','👑','🎁','🔮',
      '🌈','⚡','🌊','🌙','☀️','❄️','🍀','🌸','🌺','🌹',
    ],
  },
  {
    icon: '🐶',
    label: 'Природа',
    emojis: [
      '🐶','🐱','🐭','🐰','🦊','🐻','🐼','🐨','🐯','🦁',
      '🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐔','🐧','🐦',
      '🦆','🦅','🦉','🦇','🐺','🦄','🐝','🦋','🐛','🐌',
      '🐞','🐜','🐢','🐍','🐙','🐬','🐳','🦈','🐘','🦒',
    ],
  },
  {
    icon: '🍕',
    label: 'Еда',
    emojis: [
      '🍎','🍊','🍋','🍇','🍓','🍒','🥑','🥦','🌽','🥕',
      '🍞','🥐','🧀','🍳','🥞','🥩','🍗','🌭','🍔','🍟',
      '🍕','🌮','🌯','🥗','🍜','🍝','🍣','🍱','🧁','🎂',
      '🍰','🍩','🍪','🍫','🍬','🍭','🍿','🥛','☕','🍵',
      '🧃','🥤','🧋','🍺','🍻','🥂','🍷','🥃','🍸','🍹',
    ],
  },
  {
    icon: '🎮',
    label: 'Разное',
    emojis: [
      '⚽','🏀','🏈','⚾','🎾','🏐','🎱','🏓','🥊','🥋',
      '🎯','⛳','🎮','🕹️','🎲','♟️','🎸','🎤','🎬','📸',
      '💻','📱','📺','📻','💡','🔔','📢','💌','📦','🎁',
      '🔑','🔒','💰','💳','🏠','🚗','✈️','🚀','🛸','⚔️',
      '🛡️','🔭','🔬','💊','🩺','🧪','🧲','🔧','⚙️','🗝️',
    ],
  },
];

// Keyword map for search (emoji → search terms)
const KEYWORDS: Record<string, string> = {
  '😀':'улыбка смех рад happy smile','😃':'улыбка рад happy','😄':'улыбка смех happy','😁':'ухмылка grin','😆':'смех хохот laugh','😅':'пот sweat','😂':'слёзы смех lol','🤣':'хохот rolling laugh','😊':'мило blush','😇':'ангел angel halo',
  '🥰':'влюблён love hearts','😍':'влюблён love eyes','🤩':'звезда star struck','😘':'поцелуй kiss','😗':'поцелуй kiss','😙':'поцелуй kiss','🙂':'улыбка slight smile','🤗':'обнимашки hug','🤔':'думаю thinking','😐':'нейтральный neutral',
  '😶':'молчание no mouth','🫠':'таю melting','😏':'усмешка smirk','😒':'недовольный unamused','🙄':'закатил глаза eye roll','😬':'гримаса grimace','😔':'грустный sad','😪':'сонный sleepy','😴':'спит sleep','😷':'маска mask болен sick',
  '🤒':'болен sick fever','🤢':'тошнота nausea','🤮':'рвота vomit','🤧':'чихание sneeze','🥵','🥶':'холодно cold','🥴':'пьяный woozy','😵':'головокружение dizzy','🤯':'взрыв мозга exploding head','😳':'смущён flushed',
  '🥺':'пожалуйста pleading','🥹':'трогательный','😦':'испуган frown','😨':'страх fear','😰':'тревога anxious','😥':'облегчение sad','😢':'плачет crying','😭':'рыдает sobbing','😱':'ужас scream','😩':'устал weary',
  '😤':'злой steam','😡':'злой angry','😠':'злой mad','🤬':'матерится cursing','😈':'чёртик devil','👿':'злой angry devil','💀':'череп skull','☠️':'череп яд skull','💩':'какашка poop','🤡':'клоун clown',
  '👻':'призрак ghost','👽':'инопланетянин alien','👾':'монстр alien monster','🤖':'робот robot',
  '👋':'привет wave','🤚':'рука hand','✋':'рука hand','👍':'лайк thumbs up','👎':'дизлайк thumbs down','👏':'аплодисменты clap','🙏':'пожалуйста please pray','✊':'кулак fist','🤝':'рукопожатие handshake','💪':'сила muscle',
  '❤️':'сердце heart love','🧡':'сердце orange heart','💛':'сердце yellow heart','💚':'сердце green','💙':'сердце blue','💜':'сердце purple','🖤':'сердце black','💔':'разбитое сердце broken heart','🔥':'огонь fire','✨':'блеск sparkle',
  '💥':'взрыв boom','⭐':'звезда star','🌟':'звезда glowing star','🎉':'праздник party','🏆':'трофей trophy','💎':'алмаз gem','👑':'корона crown','🎁':'подарок gift','🌈':'радуга rainbow','⚡':'молния lightning',
  '🌊':'волна wave ocean','🌙':'луна moon','☀️':'солнце sun','❄️':'снег snow','🍀':'клевер luck','🌸':'цветок blossom','🌺':'цветок hibiscus','🌹':'роза rose',
  '🐶':'собака dog','🐱':'кошка cat','🐭':'мышь mouse','🐰':'кролик rabbit','🦊':'лиса fox','🐻':'медведь bear','🐼':'панда panda','🐨':'коала koala','🐯':'тигр tiger','🦁':'лев lion',
  '🐮':'корова cow','🐷':'свинья pig','🐸':'лягушка frog','🐵':'обезьяна monkey','🐔':'курица chicken','🐧':'пингвин penguin','🐦':'птица bird','🦆':'утка duck','🦅':'орёл eagle','🦉':'сова owl',
  '🦇':'летучая мышь bat','🐺':'волк wolf','🦄':'единорог unicorn','🐝':'пчела bee','🦋':'бабочка butterfly','🐛':'гусеница caterpillar','🐞':'божья коровка ladybug','🐢':'черепаха turtle','🐍':'змея snake','🐙':'осьминог octopus',
  '🐬':'дельфин dolphin','🐳':'кит whale','🦈':'акула shark','🐘':'слон elephant','🦒':'жираф giraffe',
  '🍎':'яблоко apple','🍊':'апельсин orange','🍋':'лимон lemon','🍇':'виноград grapes','🍓':'клубника strawberry','🍒':'вишня cherry','🥑':'авокадо avocado','🍕':'пицца pizza','🍔':'бургер burger','🍟':'картошка fries',
  '🍣':'суши sushi','🎂':'торт cake','🍩':'пончик donut','🍪':'печенье cookie','🍫':'шоколад chocolate','☕':'кофе coffee','🍵':'чай tea','🍺':'пиво beer','🍷':'вино wine',
  '⚽':'футбол soccer','🏀':'баскетбол basketball','🎮':'игры gaming','🕹️':'джойстик joystick','🎲':'кубик dice','🎸':'гитара guitar','🎤':'микрофон mic','🎬':'кино cinema','💻':'компьютер laptop','📱':'телефон phone',
  '💡':'идея лампочка idea bulb','🔑':'ключ key','🔒':'замок lock','💰':'деньги money','🏠':'дом home house','🚗':'машина car','✈️':'самолёт plane','🚀':'ракета rocket',
};

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export default function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [activeCategory, setActiveCategory] = useState(0);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [onClose]);

  // Auto-focus search on open
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const q = query.toLowerCase().trim();

  const searchResults = q
    ? CATEGORIES.flatMap(cat => cat.emojis).filter((emoji, idx, arr) => {
        // Deduplicate
        if (arr.indexOf(emoji) !== idx) return false;
        const kw = KEYWORDS[emoji] ?? '';
        return emoji === q || kw.toLowerCase().includes(q);
      })
    : null;

  const displayEmojis = searchResults ?? CATEGORIES[activeCategory].emojis;

  return (
    <div
      ref={ref}
      className="absolute bottom-full mb-2 right-0 w-72 bg-[#2b2d31] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
    >
      {/* Search */}
      <div className="px-2 pt-2 pb-1">
        <div className="flex items-center gap-1.5 bg-[#1e1f22] rounded-lg px-2.5 py-1.5">
          <Search className="w-3.5 h-3.5 text-gray-500 shrink-0" />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Поиск смайлов..."
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-gray-500 hover:text-white transition-colors text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category tabs — hidden during search */}
      {!q && (
        <div className="flex items-center border-b border-white/10 px-1 pt-0.5 gap-0.5">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat.label}
              type="button"
              onClick={() => setActiveCategory(i)}
              title={cat.label}
              className={`flex-1 text-lg py-1.5 rounded-t transition-colors ${
                activeCategory === i
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      )}

      {/* Label */}
      <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-gray-500">
        {q ? `Результаты: ${displayEmojis.length}` : CATEGORIES[activeCategory].label}
      </div>

      {/* Grid */}
      <div className="px-2 pb-2 max-h-52 overflow-y-auto">
        {displayEmojis.length === 0 ? (
          <p className="text-center text-xs text-gray-500 py-4">Ничего не найдено</p>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {displayEmojis.map((emoji, idx) => (
              <button
                key={`${emoji}-${idx}`}
                type="button"
                onClick={() => onSelect(emoji)}
                className="flex items-center justify-center text-xl aspect-square rounded hover:bg-white/10 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
