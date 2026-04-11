using System.ComponentModel.DataAnnotations;
using ChatChannelService.Application.Features.ChannelFeatures.Common;
using ChatChannelService.Application.Features.ServerFeatures.Common;
using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using ChatChannelService.Core.Enums;
using MediatR;
using Microsoft.AspNetCore.Http;
using Vibic.Shared.Core.Extensions;
using Vibic.Shared.EF.Interfaces;

namespace ChatChannelService.Application.Features.ChannelFeatures.Commands;

public record UpdateServerChannelCommand(
    Guid ServerId,
    Guid ChannelId,
    string Name,
    bool IsPublic,
    IReadOnlyCollection<Guid>? MemberIds = null)
    : IRequest<ServerChannelDto>;

public class UpdateServerChannelHandler : IRequestHandler<UpdateServerChannelCommand, ServerChannelDto>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IChannelRepository _channelRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateServerChannelHandler(
        IHttpContextAccessor httpContextAccessor,
        IChannelRepository channelRepository,
        IUnitOfWork unitOfWork)
    {
        _httpContextAccessor = httpContextAccessor;
        _channelRepository = channelRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServerChannelDto> Handle(UpdateServerChannelCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ValidationException("Channel name is required.");
        }

        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();

        Channel channel = await _channelRepository.GetServerChannelByIdForOwnerAsync(
            request.ServerId,
            request.ChannelId,
            userId,
            cancellationToken);

        List<Channel> serverChannels = await _channelRepository.GetServerChannelsByServerIdAsync(
            request.ServerId,
            cancellationToken);

        bool hasAlternativePublicTextChannel = serverChannels.Any(existingChannel =>
            existingChannel.Id != channel.Id &&
            existingChannel.ChannelType == ChannelType.Server &&
            existingChannel.IsPublic);

        if (channel.ChannelType == ChannelType.Server &&
            channel.IsPublic &&
            !request.IsPublic &&
            !hasAlternativePublicTextChannel)
        {
            throw new ValidationException("The server must keep at least one public text channel.");
        }

        channel.UpdateName(request.Name);
        channel.SetVisibility(request.IsPublic);

        if (!request.IsPublic)
        {
            HashSet<Guid> allowedUserIds = channel.Server!.ServerMembers
                .Select(serverMember => serverMember.ChatUserId)
                .ToHashSet();

            List<Guid> requestedMemberIds = request.MemberIds?
                .Distinct()
                .ToList() ?? [];

            if (requestedMemberIds.Any(memberId => !allowedUserIds.Contains(memberId)))
            {
                throw new ValidationException("Only server members can be added to a private channel.");
            }

            List<ChatUser> selectedMembers = channel.Server.ServerMembers
                .Where(serverMember => requestedMemberIds.Contains(serverMember.ChatUserId) || serverMember.ChatUserId == userId)
                .Select(serverMember => serverMember.ChatUser)
                .ToList();

            channel.SyncMembers(selectedMembers);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return channel.MapToServerChannelDto();
    }
}
