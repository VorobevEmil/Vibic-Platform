using MediatR;
using UserService.Core.Interfaces;
using Vibic.Shared.Core.Interfaces;
using UserService.Core.Entities;

namespace UserService.Application.Features.UserProfileFeatures.Create;

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
        await _unitOfWork.SaveChangesAsync();
    }
}