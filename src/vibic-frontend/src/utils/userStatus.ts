export const PREFERRED_USER_STATUS_STORAGE_KEY = 'preferred_user_status';

export interface UserStatusOption {
  value: number;
  label: string;
  description: string;
  badgeClassName: string;
  accentClassName: string;
}

export const USER_STATUS_OPTIONS: UserStatusOption[] = [
  {
    value: 1,
    label: 'В сети',
    description: 'Показывается как доступный для общения.',
    badgeClassName: 'text-green-400',
    accentClassName: 'border-green-500/50 bg-green-500/10 text-green-100',
  },
  {
    value: 2,
    label: 'Нет на месте',
    description: 'Подходит, если вы ненадолго отошли.',
    badgeClassName: 'text-yellow-400',
    accentClassName: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-100',
  },
  {
    value: 3,
    label: 'Не беспокоить',
    description: 'Показывает, что вас лучше не отвлекать.',
    badgeClassName: 'text-red-400',
    accentClassName: 'border-red-500/50 bg-red-500/10 text-red-100',
  },
  {
    value: 4,
    label: 'Не в сети',
    description: 'Статус офлайн без выхода из аккаунта.',
    badgeClassName: 'text-gray-400',
    accentClassName: 'border-gray-500/50 bg-gray-500/10 text-gray-100',
  },
  {
    value: 5,
    label: 'Невидимка',
    description: 'Вы остаетесь в приложении, но выглядите офлайн.',
    badgeClassName: 'text-violet-300',
    accentClassName: 'border-violet-500/50 bg-violet-500/10 text-violet-100',
  },
];

export function isValidUserStatus(value: number): boolean {
  return USER_STATUS_OPTIONS.some((option) => option.value === value);
}

export function getUserStatusOption(userStatus: number): UserStatusOption {
  return USER_STATUS_OPTIONS.find((option) => option.value === userStatus)
    ?? USER_STATUS_OPTIONS[0];
}
