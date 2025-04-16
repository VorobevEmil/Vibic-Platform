using MediatR;

namespace ChatChannelService.Application.Features.ServersFeatures.Commands;

public record CreateServerCommand(string Name) : IRequest<ServerDto>;