using ChatChannelService.Core.Entities;

namespace ChatChannelService.Application.Repositories;

public interface IServerMemberRepository
{
    Task CreateAsync(ServerMember serverMember, CancellationToken cancellationToken = default);
}