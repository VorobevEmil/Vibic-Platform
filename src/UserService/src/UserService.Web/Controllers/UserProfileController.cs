using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserService.Application.Features.UserProfileFeatures.Commands;
using UserService.Application.Features.UserProfileFeatures.Common;
using UserService.Application.Features.UserProfileFeatures.Queries;
using UserService.Core.Enums;
using UserService.Web.Mappings;
using UserService.Web.Models.UserProfile;
using Vibic.Shared.Core.Controllers;

namespace UserService.Web.Controllers;

[ApiController]
[Route("user-profiles")]
[Authorize]
public class UserProfileController : AuthenticateControllerBase
{
    private readonly IMediator _mediator;

    public UserProfileController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("avatar/{userId}/{fileName}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAvatar(Guid userId, string fileName)
    {
        GetAvatarQuery query = new(userId, fileName);
        Stream fileStream = await _mediator.Send(query);

        fileStream.Position = 0;

        return File(fileStream, "image/webp");
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        GetMyProfileQuery query = new();
        UserProfileDto dto = await _mediator.Send(query);

        UserProfileResponse response = dto.MapToResponse();
        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProfile(Guid id)
    {
        GetUserProfileQuery query = new(id);
        UserProfileDto dto = await _mediator.Send(query);

        UserProfileResponse response = dto.MapToResponse();

        return Ok(response);
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchProfiles(string search)
    {
        SearchUserProfilesByUsernameQuery query = new(search);

        List<UserProfileDto> userProfiles = await _mediator.Send(query);

        List<UserProfileResponse> response = userProfiles
            .Select(userProfile => userProfile.MapToResponse())
            .ToList();

        return Ok(response);
    }

    [HttpPatch("user-status/{userStatus}")]
    public async Task<IActionResult> UpdateUserStatus(UserStatus userStatus)
    {
        UpdateUserStatusCommand command = new(userStatus);

        await _mediator.Send(command);

        return Ok();
    }

    [HttpPatch("avatar")]
    public async Task<IActionResult> UpdateUserAvatar(IFormFile? file)
    {
        UpdateUserAvatarCommand command = new(file);
        string url = await _mediator.Send(command);
        AvatarResponse response = new(url);

        return Ok(response);
    }

    [HttpPatch]
    public async Task<IActionResult> UpdateUserProfile(UserProfileRequest request)
    {
        UpdateUserProfileCommand command = request.MapToCommand();

        await _mediator.Send(command);

        return NoContent();
    }
}