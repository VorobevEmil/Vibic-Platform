using ChatChannelService.Core.Entities;

namespace ChatChannelService.Application.Repositories;

public interface IInviteRepository
{
    Task<Invite> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task CreateAsync(Invite invite, CancellationToken cancellationToken = default);
}