namespace Vibic.Shared.Core.Entities;

public abstract class BaseEntity
{
    public Guid Id { get; protected set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; } = DateTime.UtcNow;
}