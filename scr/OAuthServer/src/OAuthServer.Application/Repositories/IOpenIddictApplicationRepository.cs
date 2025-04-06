using OpenIddict.EntityFrameworkCore.Models;

namespace OAuthServer.Application.Repositories;

public interface IOpenIddictApplicationRepository
{
    Task<OpenIddictEntityFrameworkCoreApplication?> GetApplicationByIdAndUserIdAsync(string applicationId, Guid userId);
    Task<List<OpenIddictEntityFrameworkCoreApplication>> GetApplicationsByUserIdAsync(Guid userId);
}