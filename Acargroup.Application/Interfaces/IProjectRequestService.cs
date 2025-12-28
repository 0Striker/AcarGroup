using Acargroup.Application.DTOs;
using Acargroup.Domain.Entities;

namespace Acargroup.Application.Interfaces;

public interface IProjectRequestService
{
    Task<ProjectRequest> CreateAsync(ProjectRequestCreateDto dto);
    Task<List<ProjectRequest>> GetAllAsync();
}
