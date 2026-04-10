using ChatChannelService.Application.Features.ServerFeatures.Common;
using ChatChannelService.Application.Interfaces;
using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;
using Vibic.Shared.Core.Exceptions;
using Vibic.Shared.Core.Extensions;
using Vibic.Shared.EF.Interfaces;
using System.IO;

namespace ChatChannelService.Application.Features.ServerFeatures.Commands;

public record UpdateServerCommand(Guid ServerId, string? Name, IFormFile? Icon) : IRequest<ServerSummaryDto>;

public class UpdateServerHandler : IRequestHandler<UpdateServerCommand, ServerSummaryDto>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IServerRepository _serverRepository;
    private readonly IChannelRepository _channelRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFileStorageClient _fileStorageClient;

    public UpdateServerHandler(
        IHttpContextAccessor httpContextAccessor,
        IServerRepository serverRepository,
        IChannelRepository channelRepository,
        IUnitOfWork unitOfWork,
        IFileStorageClient fileStorageClient)
    {
        _httpContextAccessor = httpContextAccessor;
        _serverRepository = serverRepository;
        _channelRepository = channelRepository;
        _unitOfWork = unitOfWork;
        _fileStorageClient = fileStorageClient;
    }

    public async Task<ServerSummaryDto> Handle(UpdateServerCommand request, CancellationToken cancellationToken)
    {
        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();

        Server server = await _serverRepository.GetServerByIdAsync(request.ServerId, cancellationToken);

        if (server.OwnerId != userId)
        {
            throw new ForbiddenException("You do not have permission to update this server");
        }

        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            server.UpdateName(request.Name);
        }

        if (request.Icon != null)
        {
            await using Stream stream = request.Icon.OpenReadStream();
            string storedPath = await _fileStorageClient.UploadServerIconAsync(server.Id, stream, request.Icon.FileName);
            string storedFileName = Path.GetFileName(storedPath);
            server.SetIconUrl($"/files/servers/{server.Id}/{storedFileName}");
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        Channel channel = await _channelRepository.GetFirstChannelOfServerAsync(server.Id, cancellationToken);

        return server.MapToServerSummaryDto(channel);
    }
}
