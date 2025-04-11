using MediatR;

namespace OAuthServer.Application.Features.Settings.ApplicationFeatures.Delete;

public record DeleteApplicationCommand(string Id) : IRequest;