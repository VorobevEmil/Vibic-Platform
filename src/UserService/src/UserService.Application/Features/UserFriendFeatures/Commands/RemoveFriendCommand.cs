using MediatR;
using Microsoft.AspNetCore.Http;
using UserService.Application.Repositories;
using Vibic.Shared.Core.Exceptions;
using Vibic.Shared.Core.Extensions;
using Vibic.Shared.EF.Interfaces;

namespace UserService.Application.Features.UserFriendFeatures.Commands;

public record RemoveFriendCommand(Guid FriendId) : IRequest;

public class RemoveFriendCommandHandler : IRequestHandler<RemoveFriendCommand>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IUserFriendRepository _userFriendRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RemoveFriendCommandHandler(
        IHttpContextAccessor httpContextAccessor,
        IUserFriendRepository userFriendRepository,
        IUnitOfWork unitOfWork)
    {
        _httpContextAccessor = httpContextAccessor;
        _userFriendRepository = userFriendRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(RemoveFriendCommand request, CancellationToken cancellationToken)
    {
        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();

        bool removed = await _userFriendRepository
            .RemoveFriendshipAsync(userId, request.FriendId, cancellationToken);

        if (!removed)
        {
            throw new NotFoundException("Friend relationship was not found.");
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
