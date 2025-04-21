using ChatChannelService.Application.Common.Pagination;
using ChatChannelService.Application.Features.MessageFeatures.Common;
using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;
using Vibic.Shared.Core.Exceptions;
using Vibic.Shared.Core.Extensions;

namespace ChatChannelService.Application.Features.MessageFeatures.Queries;

public record GetMessagesQuery(Guid ChannelId, string? Cursor, int Limit) : IRequest<CursorPaginatedResult<MessageDto>>;

public class GetMessagesHandler : IRequestHandler<GetMessagesQuery, CursorPaginatedResult<MessageDto>>
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

    public async Task<CursorPaginatedResult<MessageDto>> Handle(GetMessagesQuery request, CancellationToken cancellationToken)
    {
        Cursor? cursor = null;
        if (!string.IsNullOrEmpty(request.Cursor))
        {
            cursor = Cursor.Decode(request.Cursor);
            if (cursor is null)
            {
                throw new BadRequestException("Invalid cursor");
            }
        }

        if (request.Limit > 100)
        {
            throw new BadRequestException("Limit cannot be greater than 100");
        }

        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();

        Channel? channel = await _channelRepository
            .GetUserDirectChannelByIdAsync(userId, request.ChannelId, cancellationToken);

        if (channel == null)
        {
            throw new NotFoundException("Channel not found");
        }

        List<Message> messages = await _messageRepository
            .GetAllByChannelIdAsync(request.ChannelId, cursor, request.Limit, cancellationToken);

        bool hasMore = messages.Count > request.Limit;
      
        DateTime? nextDate = messages.Count > request.Limit ? messages[^1].CreatedAt : null;
        Guid? nextId = messages.Count > request.Limit ? messages[^1].Id : null;

        if (hasMore)
        {
            messages.RemoveAt(messages.Count - 1);
        }
        
        messages.Reverse();
        
        List<MessageDto> messagesDto = messages
            .ConvertAll(m => m.MapToDto());

        string? encodeCursor = nextDate != null && nextId != null ? Cursor.Encode(nextDate.Value, nextId.Value) : null;

        CursorPaginatedResult<MessageDto> result = new(messagesDto, encodeCursor, hasMore);

        return result;
    }
}