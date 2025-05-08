using System.ComponentModel.DataAnnotations;
using ChatChannelService.Application.Features.ChannelFeatures.Common;
using ChatChannelService.Application.Features.ServerFeatures.Common;
using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using ChatChannelService.Core.Enums;
using MediatR;
using Microsoft.AspNetCore.Http;
using Vibic.Shared.Core.Exceptions;
using Vibic.Shared.Core.Extensions;
using Vibic.Shared.EF.Interfaces;

namespace ChatChannelService.Application.Features.ChannelFeatures.Commands;

public record CreateServerChannelCommand(Guid ServerId, string Name, ChannelType ChannelType, bool IsPublic)
    : IRequest<ServerChannelDto>;

public class CreateServerChannelHandler : IRequestHandler<CreateServerChannelCommand, ServerChannelDto>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IServerRepository _serverRepository;
    private readonly IChatUserRepository _chatUserRepository;
    private readonly IChannelRepository _channelRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateServerChannelHandler(
        IHttpContextAccessor httpContextAccessor,
        IServerRepository serverRepository,
        IChatUserRepository chatUserRepository,
        IChannelRepository channelRepository,
        IUnitOfWork unitOfWork)
    {
        _httpContextAccessor = httpContextAccessor;
        _serverRepository = serverRepository;
        _chatUserRepository = chatUserRepository;
        _channelRepository = channelRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServerChannelDto> Handle(CreateServerChannelCommand request, CancellationToken cancellationToken)
    {
        if (request.ChannelType != ChannelType.Server && request.ChannelType != ChannelType.Voice)
        {
            throw new ValidationException("This channel type is not supported for creating servers.");
        }

        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();

        Server server = await _serverRepository.GetServerByIdAsync(request.ServerId, cancellationToken);

        if (server.OwnerId != userId)
        {
            throw new ForbiddenException("You cannot create a server channel.");
        }

        Channel channel = Channel.CreateServerChannel(request.Name, server, request.ChannelType, request.IsPublic);

        await _channelRepository.CreateAsync(channel, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return channel.MapToServerChannelDto();
    }
}