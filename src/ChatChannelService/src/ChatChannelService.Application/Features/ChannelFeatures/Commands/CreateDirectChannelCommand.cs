using ChatChannelService.Application.Features.ChannelFeatures.Common;
using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Vibic.Shared.Core.Extensions;
using Vibic.Shared.EF.Interfaces;

namespace ChatChannelService.Application.Features.ChannelFeatures.Commands;

public record CreateDirectChannelCommand(Guid UserId) : IRequest<DirectChannelDto?>;

public class CreateDirectChannelHandler : IRequestHandler<CreateDirectChannelCommand, DirectChannelDto?>
{
    private readonly IConfiguration _configuration;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IChatUserRepository _chatUserRepository;
    private readonly IChannelRepository _channelRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateDirectChannelHandler(
        IConfiguration configuration,
        IHttpContextAccessor httpContextAccessor,
        IChatUserRepository chatUserRepository,
        IChannelRepository channelRepository,
        IUnitOfWork unitOfWork)
    {
        _configuration = configuration;
        _httpContextAccessor = httpContextAccessor;
        _chatUserRepository = chatUserRepository;
        _channelRepository = channelRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<DirectChannelDto?> Handle(CreateDirectChannelCommand request,
        CancellationToken cancellationToken)
    {
        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();
        List<ChatUser> chatUsers =
        [
            await _chatUserRepository.GetByIdAsync(request.UserId, cancellationToken),
            await _chatUserRepository.GetByIdAsync(userId, cancellationToken)
        ];

        if (await _channelRepository.DoesDirectChannelWithUsersExistAsync(userId, request.UserId, cancellationToken))
        {
            return null;
        }

        Channel channel = Channel.CreateDirectChannel();

        foreach (ChatUser? chatUser in chatUsers)
        {
            ChannelMember channelMember = new(channel, chatUser!);

            channel.ChannelMembers.Add(channelMember);
        }

        await _channelRepository.CreateAsync(channel, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return channel.MapToDirectChannelDto(_configuration);
    }
}