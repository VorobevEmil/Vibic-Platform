using ChatChannelService.Application.Features.MessageFeatures.Common;
using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using MediatR;
using Microsoft.Extensions.Configuration;

namespace ChatChannelService.Application.Features.MessageFeatures.Queries;

public record GetMessageByIdQuery(Guid MessageId) : IRequest<MessageDto?>;

public class GetMessageByIdHandler : IRequestHandler<GetMessageByIdQuery, MessageDto?>
{
    private readonly IMessageRepository _messageRepository;
    private readonly IConfiguration _configuration;

    public GetMessageByIdHandler(IMessageRepository messageRepository, IConfiguration configuration)
    {
        _messageRepository = messageRepository;
        _configuration = configuration;
    }

    public async Task<MessageDto?> Handle(GetMessageByIdQuery request, CancellationToken cancellationToken)
    {
        Message? message = await _messageRepository.GetByIdAsync(request.MessageId, cancellationToken);

        if (message is null)
        {
            return null;
        }

        return message.MapToDto(_configuration);
    }
}
