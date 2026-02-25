using Acargroup.Application.DTOs;

namespace Acargroup.Application.Interfaces;

public interface IProjectService
{
    Task<List<ProjectListDto>> GetByStatusAsync(string status);
    Task<List<ProjectListDto>> GetFeaturedAsync(int take);
    Task<ProjectDetailDto?> GetBySlugAsync(string slug);
}

public interface IProjectAdminService
{
    Task<List<ProjectAdminListDto>> GetAllAsync();
    Task<ProjectDetailDto?> GetByIdAsync(int id);
    Task<int> CreateAsync(ProjectAdminCreateUpdateDto dto);
    Task UpdateAsync(int id, ProjectAdminCreateUpdateDto dto);
    Task DeleteAsync(int id);
}

public interface IReferenceService
{
    Task<List<ReferenceDto>> GetAllActiveAsync();
}

public interface IReferenceAdminService
{
    Task<List<ReferenceAdminListDto>> GetAllAsync();
    Task<ReferenceDto?> GetByIdAsync(int id);
    Task<int> CreateAsync(ReferenceAdminCreateUpdateDto dto);
    Task UpdateAsync(int id, ReferenceAdminCreateUpdateDto dto);
    Task DeleteAsync(int id);
}
