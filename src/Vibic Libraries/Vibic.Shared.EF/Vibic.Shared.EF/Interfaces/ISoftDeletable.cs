namespace Vibic.Shared.EF.Interfaces;

public interface ISoftDeletable
{
    public bool IsDeleted { get; }
    public DateTime? DeletedAt { get; }
}