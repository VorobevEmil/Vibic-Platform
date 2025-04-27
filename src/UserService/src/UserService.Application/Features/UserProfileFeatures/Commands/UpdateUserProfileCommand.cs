using MediatR;
using Microsoft.AspNetCore.Http;
using UserService.Application.Repositories;
using UserService.Core.Entities;
using Vibic.Shared.Core.Extensions;
using Vibic.Shared.EF.Interfaces;

namespace UserService.Application.Features.UserProfileFeatures.Commands;

public record UpdateUserProfileCommand(string Username, string? AvatarUrl, string? Bio) : IRequest;

public class UpdateUserProfileHandler : IRequestHandler<UpdateUserProfileCommand>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IUserProfileRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    
    public UpdateUserProfileHandler(
        IHttpContextAccessor httpContextAccessor,
        IUserProfileRepository repository,
        IUnitOfWork unitOfWork)
    {
        _httpContextAccessor = httpContextAccessor;
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(UpdateUserProfileCommand command, CancellationToken cancellationToken)
    {
        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();
        UserProfile userProfile = await _repository.GetByIdAsync(userId, cancellationToken);

        userProfile.UpdateProfile(
            command.Username,
            command.AvatarUrl,
            command.Bio);
        
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}