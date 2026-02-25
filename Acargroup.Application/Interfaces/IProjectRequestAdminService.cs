using Acargroup.Application.DTOs;

namespace Acargroup.Application.Interfaces;

public interface IProjectRequestAdminService
{
    Task<List<ProjectRequestListDto>> GetAllAsync(string? status = null, bool includeArchived = false);
    Task<ProjectRequestDetailDto?> GetByIdAsync(int id);
    Task UpdateStatusAsync(int id, string status);
    Task ArchiveAsync(int id);
    Task<byte[]> GeneratePdfAsync(int id);
}
