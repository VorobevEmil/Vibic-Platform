using MediatR;
using Microsoft.AspNetCore.Mvc;
using UserService.Application.Features.FriendRequestFeatures.Command;
using UserService.Application.Features.FriendRequestFeatures.Common;
using UserService.Application.Features.FriendRequestFeatures.Queries;
using UserService.Application.Features.UserFriendFeatures.Queries;
using UserService.Application.Features.UserProfileFeatures.Common;
using UserService.Web.Mappings;
using UserService.Web.Models.Friends.Responses;
using UserService.Web.Models.UserProfile;
using Vibic.Shared.Core.Controllers;

namespace UserService.Web.Controllers;

[Route("friends")]
public class FriendsController(IMediator mediator) : AuthenticateControllerBase
{
    [HttpPost("request/{receiverId}")]
    public async Task<IActionResult> SendFriendRequest(Guid receiverId)
    {
        CreateFriendRequestCommand command = new(receiverId);

        await mediator.Send(command);

        return Ok("Friend request sent.");
    }

    [HttpPost("accept/{requestId}")]
    public async Task<IActionResult> AcceptRequest(Guid requestId)
    {
        AcceptFriendRequestCommand command = new(requestId);

        await mediator.Send(command);

        return Ok("Friend request accepted.");
    }


    [HttpPost("reject/{requestId}")]
    public async Task<IActionResult> RejectRequest(Guid requestId)
    {
        RejectFriendRequestCommand command = new(requestId);

        await mediator.Send(command);

        return Ok("Friend request rejected.");
    }

    // 4. Удалить друга
    // [HttpDelete("{friendId}")]
    // public async Task<IActionResult> RemoveFriend(Guid friendId)
    // {
    //     // var userId = GetUserId();
    //     // await _friendService.RemoveFriendAsync(userId, friendId);
    //     // return Ok("Friend removed.");
    // }

    [HttpGet]
    public async Task<IActionResult> GetFriends()
    {
        GetUserFriendsQuery query = new();

        List<UserProfileDto> friends = await mediator.Send(query);

        List<UserProfileResponse> responses = friends
            .ConvertAll(f => f.MapToResponse());

        return Ok(responses);
    }

    [HttpGet("requests/incoming")]
    public async Task<IActionResult> GetIncomingRequests()
    {
        GetIncomingRequestsQuery query = new();

        List<FriendRequestDto> friendRequests = await mediator.Send(query);

        List<FriendRequestResponse> responses = friendRequests
            .ConvertAll(f => f.MapToResponse());

        return Ok(responses);
    }

    [HttpGet("requests/outgoing")]
    public async Task<IActionResult> GetOutgoingRequests()
    {
        GetOutgoingRequestsQuery query = new();

        List<FriendRequestDto> friendRequests = await mediator.Send(query);

        List<FriendRequestResponse> responses = friendRequests
            .ConvertAll(f => f.MapToResponse());

        return Ok(responses);
    }
}