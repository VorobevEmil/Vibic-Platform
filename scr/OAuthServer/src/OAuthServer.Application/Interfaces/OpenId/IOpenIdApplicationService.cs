using OAuthServer.Application.DTOs.Settings.Applications;

namespace OAuthServer.Application.Interfaces.OpenId;

public interface IOpenIdApplicationService
{
    Task<List<ApplicationResponse>> GetAllAsync();
    Task<ApplicationResponse> GetByIdAsync(string id);
    Task<ApplicationResponse> CreateAsync(ApplicationDto dto);
    Task UpdateAsync(ApplicationDto dto);
    Task DeleteAsync(string id);
}