export function formatMessageTime(sentAt: Date | string): string {
  const date = new Date(sentAt);
  const now = new Date();

  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  const timeStr = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  if (isToday) return `сегодня в ${timeStr}`;
  if (isYesterday) return `вчера в ${timeStr}`;

  const dayMonth = date
    .toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
    .replace(/\.$/, ''); // Russian locale adds trailing dot: "6 апр."

  return `${dayMonth} в ${timeStr}`;
}

export function formatTimeOnly(sentAt: Date | string): string {
  return new Date(sentAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}
