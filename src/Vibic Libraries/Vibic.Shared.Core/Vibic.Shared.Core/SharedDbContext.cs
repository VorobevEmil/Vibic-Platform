using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata;
using Vibic.Shared.Core.Interfaces;

namespace Vibic.Shared.Core;

public abstract class SharedDbContext : DbContext
{
    protected SharedDbContext(DbContextOptions dbContext) : base(dbContext)
    {
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = new())
    {
        SetSoftDeletedEntries();
        SetUpdatedEntries();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void SetSoftDeletedEntries()
    {
        IEnumerable<EntityEntry<ISoftDeletable>> softDeletedEntries = ChangeTracker
            .Entries<ISoftDeletable>()
            .Where(e => e.State == EntityState.Deleted);

        foreach (EntityEntry<ISoftDeletable> softDeletedEntry in softDeletedEntries)
        {
            softDeletedEntry.State = EntityState.Modified;
            softDeletedEntry.Property(nameof(ISoftDeletable.IsDeleted)).CurrentValue = true;
            softDeletedEntry.Property(nameof(ISoftDeletable.DeletedAt)).CurrentValue = DateTime.UtcNow;
        }
    }

    private void SetUpdatedEntries()
    {
        IEnumerable<EntityEntry<IUpdatable>> updatableEntries = ChangeTracker
            .Entries<IUpdatable>()
            .Where(e => e.State == EntityState.Deleted);

        foreach (EntityEntry<IUpdatable> updatedEntry in updatableEntries)
        {
            updatedEntry.Property(nameof(IUpdatable.UpdatedAt)).CurrentValue = DateTime.UtcNow;
        }
    }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        foreach (IMutableEntityType entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (!typeof(ISoftDeletable).IsAssignableFrom(entityType.ClrType)) continue;

            ParameterExpression parameter = Expression.Parameter(entityType.ClrType, "e");
            MemberExpression property = Expression.Property(parameter, nameof(ISoftDeletable.IsDeleted));
            UnaryExpression notDeleted = Expression.Not(property);
            LambdaExpression lambda = Expression.Lambda(notDeleted, parameter);

            modelBuilder.Entity(entityType.ClrType).HasQueryFilter(lambda);
        }
        
        modelBuilder.ApplyConfigurationsFromAssembly(GetType().Assembly);
    }
}