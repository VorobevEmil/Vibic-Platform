using ChatChannelService.Application.Repositories;
using ChatChannelService.Core.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;
using Vibic.Shared.Core.Exceptions;
using Vibic.Shared.Core.Extensions;
using Vibic.Shared.EF.Interfaces;

namespace ChatChannelService.Application.Features.ServerFeatures.Commands;

public record DeleteServerCommand(Guid Id) : IRequest;

public class DeleteServerHandler : IRequestHandler<DeleteServerCommand>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IServerRepository _serverRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteServerHandler(
        IHttpContextAccessor httpContextAccessor,
        IServerRepository serverRepository,
        IUnitOfWork unitOfWork)
    {
        _httpContextAccessor = httpContextAccessor;
        _serverRepository = serverRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteServerCommand request, CancellationToken cancellationToken)
    {
        HttpContext httpContext = _httpContextAccessor.HttpContext!;

        Server server = await _serverRepository.GetServerByIdAsync(request.Id, cancellationToken);


        if (server.OwnerId != httpContext.User.GetUserId())
        {
            throw new ForbiddenException("You do not have permission to delete this server");
        }

        _serverRepository.Delete(server);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}