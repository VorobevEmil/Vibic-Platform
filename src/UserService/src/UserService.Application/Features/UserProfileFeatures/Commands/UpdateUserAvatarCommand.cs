using MassTransit;
using MediatR;
using Microsoft.AspNetCore.Http;
using UserService.Application.Interfaces;
using UserService.Application.Repositories;
using UserService.Core.Entities;
using Vibic.Shared.Core.Extensions;
using Vibic.Shared.EF.Interfaces;
using Vibic.Shared.Messaging.Contracts.Users;

namespace UserService.Application.Features.UserProfileFeatures.Commands;

public record UpdateUserAvatarCommand(IFormFile? FormFile) : IRequest<string>;

public class UpdateUserAvatarHandler : IRequestHandler<UpdateUserAvatarCommand, string>
{
    private static readonly string[] AllowedImageMimeTypes =
    {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/jpg"
    };

    private readonly IFileStorageClient _fileStorageClient;
    private readonly IUserProfileRepository _userProfileRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IBus _bus;

    public UpdateUserAvatarHandler(
        IFileStorageClient fileStorageClient,
        IUserProfileRepository userProfileRepository,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        IBus bus)
    {
        _fileStorageClient = fileStorageClient;
        _userProfileRepository = userProfileRepository;
        _unitOfWork = unitOfWork;
        _httpContextAccessor = httpContextAccessor;
        _bus = bus;
    }

    public async Task<string> Handle(UpdateUserAvatarCommand request, CancellationToken cancellationToken)
    {
        if (request.FormFile == null || request.FormFile.Length == 0)
        {
            throw new ArgumentException("File is empty.");
        }

        if (!AllowedImageMimeTypes.Contains(request.FormFile.ContentType.ToLower()))
        {
            throw new ArgumentException("Only images can be uploaded (JPEG, PNG, WEBP, GIF).");
        }

        Guid userId = _httpContextAccessor.HttpContext!.User.GetUserId();
        UserProfile userProfile = await _userProfileRepository.GetByIdAsync(userId, cancellationToken);

        await using Stream stream = request.FormFile.OpenReadStream();
        string fileName = request.FormFile.FileName;

        string avatarPath = await _fileStorageClient.UploadAvatarAsync(userId, stream, fileName);

        string avatarUrl = $"https://localhost:7155/user-profiles/{avatarPath}";

        userProfile.UpdateAvatarUrl(avatarUrl);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        await _bus.Publish(new UpdateUserAvatarEvent(userId, avatarUrl), cancellationToken);

        return avatarUrl;
    }
}