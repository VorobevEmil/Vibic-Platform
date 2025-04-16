using MediatR;
using UserService.Application.Repositories;
using UserService.Core.Entities;
using Vibic.Shared.Core.Interfaces;

namespace UserService.Application.Features.UserProfileFeatures.Commands;

public sealed record CreateUserProfileCommand(Guid UserId, string Username, string Email) : IRequest;

public class CreateUserProfileHandler : IRequestHandler<CreateUserProfileCommand>
{
    private readonly IUserProfileRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateUserProfileHandler(IUserProfileRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(CreateUserProfileCommand request, CancellationToken cancellationToken)
    {
        bool exists = await _repository.ExistsAsync(request.UserId);
        if (exists) return;

        UserProfile profile = new(request.UserId, request.Username, request.Email);
        await _repository.AddAsync(profile);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}