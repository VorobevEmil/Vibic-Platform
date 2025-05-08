using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using ChatChannelService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Vibic.Shared.Core.Exceptions;

namespace ChatChannelService.Infrastructure.Repositories;

public class InviteRepository : IInviteRepository
{
    private readonly ApplicationDbContext _dbContext;

    public InviteRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Invite> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        Invite? invite = await _dbContext.Invites
            .Include(i => i.Server)
            .ThenInclude(s => s.ServerMembers)
            .Include(i => i.Server)
            .ThenInclude(s => s.Channels
                .Where(c => c.IsPublic)
                .OrderBy(c => c.CreatedAt))
            .FirstOrDefaultAsync(i => i.Code == code, cancellationToken: cancellationToken);

        if (invite is null)
        {
            throw new NotFoundException("Invite not found");
        }
        
        return invite;
    }

    public async Task CreateAsync(Invite invite, CancellationToken cancellationToken = default)
    {
        await _dbContext.Invites.AddAsync(invite, cancellationToken);
    }
}