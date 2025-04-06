using System.Security.Claims;
using MediatR;
using OpenIddict.Abstractions;

namespace OAuthServer.Application.Features.OpenId.Authorize;

public record AuthorizeCommand(OpenIddictRequest Request) : IRequest<ClaimsPrincipal>;