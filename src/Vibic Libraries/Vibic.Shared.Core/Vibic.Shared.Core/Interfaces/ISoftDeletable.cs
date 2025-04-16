namespace Vibic.Shared.Core.Interfaces;

public interface ISoftDeletable
{
    public bool IsDeleted { get; }
    public DateTime? DeletedAt { get; }
}