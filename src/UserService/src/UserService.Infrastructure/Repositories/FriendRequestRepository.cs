using Microsoft.EntityFrameworkCore;
using UserService.Application.Repositories;
using UserService.Core.Entities;
using UserService.Infrastructure.Data;
using Vibic.Shared.Core.Exceptions;

namespace UserService.Infrastructure.Repositories;

public class FriendRequestRepository : IFriendRequestRepository
{
    private readonly ApplicationDbContext _context;

    public FriendRequestRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<FriendRequest> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        FriendRequest? friendRequest = await _context.FriendRequests
            .Include(fr => fr.Sender)
            .Include(fr => fr.Receiver)
            .FirstOrDefaultAsync(fr => fr.Id == id, cancellationToken);

        if (friendRequest is null)
        {
            throw new NotFoundException("Friend request not found");
        }


        return friendRequest;
    }

    public async Task<List<FriendRequest>> GetIncomingRequestsAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await _context.FriendRequests
            .Include(fr => fr.Sender)
            .Where(fr => fr.ReceiverId == userId && fr.Status == FriendRequestStatus.Pending)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<FriendRequest>> GetOutgoingRequestsAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await _context.FriendRequests
            .Include(fr => fr.Receiver)
            .Where(fr => fr.SenderId == userId && fr.Status == FriendRequestStatus.Pending)
            .ToListAsync(cancellationToken);
    }

    public async Task CreateAsync(FriendRequest friendRequest, CancellationToken cancellationToken = default)
    {
        await _context.FriendRequests.AddAsync(friendRequest, cancellationToken);
    }
}