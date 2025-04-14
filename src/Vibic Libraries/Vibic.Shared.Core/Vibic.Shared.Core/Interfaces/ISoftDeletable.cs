namespace Vibic.Shared.Core.Interfaces;

public interface ISoftDeletable
{
    public bool IsDeleted { get; init; }
    public DateTime? DeletedAt { get; init; }
}