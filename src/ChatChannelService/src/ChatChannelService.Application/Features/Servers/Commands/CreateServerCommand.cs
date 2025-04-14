using MediatR;

namespace ChatChannelService.Application.Features.Servers.Commands;

public record CreateServerCommand(string Name) : IRequest<ServerDto>;