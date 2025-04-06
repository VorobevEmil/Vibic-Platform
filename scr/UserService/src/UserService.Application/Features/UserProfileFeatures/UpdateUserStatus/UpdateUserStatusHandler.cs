using MediatR;
using Microsoft.AspNetCore.Http;
using UserService.Core.Interfaces;
using Vibic.Shared.Core.Exceptions;
using Vibic.Shared.Core.Extensions;
using Vibic.Shared.Core.Interfaces;
using UserService.Core.Entities;

namespace UserService.Application.Features.UserProfileFeatures.UpdateUserStatus;

public class UpdateUserStatusHandler : IRequestHandler<UpdateUserStatusCommand>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IUserProfileRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateUserStatusHandler(
        IHttpContextAccessor httpContextAccessor,
        IUserProfileRepository repository,
        IUnitOfWork unitOfWork)
    {
        _httpContextAccessor = httpContextAccessor;
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(UpdateUserStatusCommand request, CancellationToken cancellationToken)
    {
        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();
        UserProfile userProfile = await _repository.GetByIdAsync(userId)
                                  ?? throw new NotFoundException("User profile not found");

        userProfile.UpdateStatus(request.UserStatus);
        await _unitOfWork.SaveChangesAsync();
    }
}