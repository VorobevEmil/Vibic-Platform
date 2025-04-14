using MassTransit;
using MediatR;
using OAuthServer.Application.Repositories;
using OAuthServer.Core.Entities;
using Vibic.Shared.Core.Exceptions;
using Vibic.Shared.Core.Interfaces;
using Vibic.Shared.Messaging.Contracts.Users;

namespace OAuthServer.Application.Features.AuthFeatures.Commands;

public record SignUpCommand(string Username, string Email, string Password) : IRequest;

public class SignUpHandler : IRequestHandler<SignUpCommand>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IBus _bus;

    public SignUpHandler(
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        IBus bus)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _bus = bus;
    }

    public async Task Handle(SignUpCommand command, CancellationToken cancellationToken)
    {
        User? existingUser = await _userRepository.GetByEmailAsync(command.Email, cancellationToken);
        if (existingUser != null)
        {
            throw new BadRequestException("User with this email already exists.");
        }

        string passwordHash = BCrypt.Net.BCrypt.HashPassword(command.Password);

        User user = new(command.Username, command.Email, passwordHash);
        await _userRepository.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _bus.Publish(new CreateUserProfileEvent(
            user.Id,
            user.Username,
            user.Email
        ), cancellationToken);
        
        await _bus.Publish(new CreateUserChatEvent(
            user.Id,
            user.Username), cancellationToken);
    }
}