using System.ComponentModel.DataAnnotations;
using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using ChatChannelService.Core.Enums;
using MediatR;
using Microsoft.AspNetCore.Http;
using Vibic.Shared.Core.Exceptions;
using Vibic.Shared.Core.Extensions;
using Vibic.Shared.EF.Interfaces;

namespace ChatChannelService.Application.Features.ChannelFeatures.Commands;

public record DeleteServerChannelCommand(Guid ServerId, Guid ChannelId) : IRequest;

public class DeleteServerChannelHandler : IRequestHandler<DeleteServerChannelCommand>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IChannelRepository _channelRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteServerChannelHandler(
        IHttpContextAccessor httpContextAccessor,
        IChannelRepository channelRepository,
        IUnitOfWork unitOfWork)
    {
        _httpContextAccessor = httpContextAccessor;
        _channelRepository = channelRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteServerChannelCommand request, CancellationToken cancellationToken)
    {
        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();

        Channel channel = await _channelRepository.GetServerChannelByIdAsync(
            request.ServerId,
            request.ChannelId,
            cancellationToken);

        if (channel.Server?.OwnerId != userId)
        {
            throw new ForbiddenException("You do not have permission to delete this channel.");
        }

        List<Channel> serverChannels = await _channelRepository.GetServerChannelsByServerIdAsync(
            request.ServerId,
            cancellationToken);

        bool hasAlternativePublicTextChannel = serverChannels.Any(existingChannel =>
            existingChannel.Id != channel.Id &&
            existingChannel.ChannelType == ChannelType.Server &&
            existingChannel.IsPublic);

        if (channel.ChannelType == ChannelType.Server &&
            channel.IsPublic &&
            !hasAlternativePublicTextChannel)
        {
            throw new ValidationException("The server must keep at least one public text channel.");
        }

        _channelRepository.Delete(channel);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
