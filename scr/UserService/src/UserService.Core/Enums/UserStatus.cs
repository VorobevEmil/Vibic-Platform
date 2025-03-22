namespace UserService.Core.Enums;

public enum UserStatus
{
    Online = 1, // 🟢 В сети
    Idle = 2, // 🌙 Нет на месте
    DoNotDisturb = 3, // 🔴 Не беспокоить
    Offline = 4, // ⚫ Не в сети	
    Invisible = 5 // 👻 Невидимка
}