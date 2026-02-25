using Acargroup.Application.DTOs;

namespace Acargroup.Application.Interfaces;

public interface IInternetApplicationService
{
    Task<List<InternetApplicationDto>> GetAllAsync();
    Task<InternetApplicationDto?> GetByIdAsync(int id);
    Task<InternetApplicationDto> CreateAsync(CreateInternetApplicationDto createDto);
    Task<bool> UpdateStatusAsync(int id, int status);
    Task<bool> DeleteAsync(int id);
}
