using OAuthServer.Application.DTOs.Settings.Applications;

namespace OAuthServer.Application.Interfaces.OpenId;

public interface IOpenIdApplicationService
{
    Task<string> CreateAsync(ApplicationDto dto);
    Task UpdateAsync(ApplicationDto dto);
    Task DeleteAsync(string id);
}