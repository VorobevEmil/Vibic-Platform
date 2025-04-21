using ChatChannelService.Application.Features.MessageFeatures.Common;
using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;
using Vibic.Shared.Core.Exceptions;
using Vibic.Shared.Core.Extensions;

namespace ChatChannelService.Application.Features.MessageFeatures.Queries;

public record GetMessagesQuery(Guid ChannelId) : IRequest<List<MessageDto>>;

public class GetMessagesHandler : IRequestHandler<GetMessagesQuery, List<MessageDto>>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IChannelRepository _channelRepository;
    private readonly IMessageRepository _messageRepository;

    public GetMessagesHandler(
        IHttpContextAccessor httpContextAccessor,
        IChannelRepository channelRepository,
        IMessageRepository messageRepository)
    {
        _httpContextAccessor = httpContextAccessor;
        _channelRepository = channelRepository;
        _messageRepository = messageRepository;
    }

    public async Task<List<MessageDto>> Handle(GetMessagesQuery request, CancellationToken cancellationToken)
    {
        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();

        Channel? channel = await _channelRepository
            .GetUserDirectChannelByIdAsync(userId, request.ChannelId, cancellationToken);

        if (channel == null)
        {
            throw new NotFoundException("Channel not found");
        }

        List<Message> messages = await _messageRepository
            .GetAllByChannelIdAsync(request.ChannelId, cancellationToken);

        return messages
            .ConvertAll(m => m.MapToDto());
    }
}