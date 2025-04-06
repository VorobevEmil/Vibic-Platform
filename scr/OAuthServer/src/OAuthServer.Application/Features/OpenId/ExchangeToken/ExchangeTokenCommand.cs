using System.Security.Claims;
using MediatR;
using OpenIddict.Abstractions;

namespace OAuthServer.Application.Features.OpenId.ExchangeToken;

public record ExchangeTokenCommand(OpenIddictRequest Request) : IRequest<ClaimsPrincipal>;