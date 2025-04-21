using MediatR;

namespace ChatChannelService.Application.Features.ServerFeatures.Commands;

public record CreateServerCommand(string Name) : IRequest<ServerDto>;