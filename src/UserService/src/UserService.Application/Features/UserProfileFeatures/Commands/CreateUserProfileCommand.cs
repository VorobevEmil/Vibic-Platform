using MassTransit;
using MediatR;
using UserService.Application.Repositories;
using UserService.Core.Entities;
using Vibic.Shared.EF.Interfaces;
using Vibic.Shared.Messaging.Contracts.Users;

namespace UserService.Application.Features.UserProfileFeatures.Commands;

public sealed record CreateUserProfileCommand(Guid UserId, string DisplayName,  string Username, string Email) : IRequest;

public class CreateUserProfileHandler : IRequestHandler<CreateUserProfileCommand>
{
    private readonly IUserProfileRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IBus _bus;

    private static readonly List<string> DefaultAvatarUrls =
    [
        "/default/vibic_avatar_1.svg",
        "/default/vibic_avatar_2.svg",
        "/default/vibic_avatar_3.svg"
    ];

    public CreateUserProfileHandler(
        IUserProfileRepository repository,
        IUnitOfWork unitOfWork,
        IBus bus)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _bus = bus;
    }

    public async Task Handle(CreateUserProfileCommand request, CancellationToken cancellationToken)
    {
        bool exists = await _repository.ExistsAsync(request.UserId, cancellationToken);
        if (exists) return;

        Random random = new();

        string avatarUrl = DefaultAvatarUrls[random.Next(DefaultAvatarUrls.Count)];

        UserProfile profile = new(request.UserId, request.DisplayName, request.Username, request.Email, avatarUrl);
        await _repository.AddAsync(profile, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _bus.Publish(new CreateUserChatEvent(request.UserId, request.DisplayName, request.Username, avatarUrl), cancellationToken);
    }
}