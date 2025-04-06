namespace Vibic.Shared.Core.Interfaces;

public interface IUnitOfWork
{
    Task SaveChangesAsync();
}