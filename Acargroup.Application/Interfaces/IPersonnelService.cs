using Acargroup.Application.DTOs;

namespace Acargroup.Application.Interfaces;

public interface IPersonnelService
{
    Task<IEnumerable<PersonnelDto>> GetAllAsync();
    Task<PersonnelDto?> GetByIdAsync(int id);
    Task<PersonnelDto> CreateAsync(PersonnelCreateDto dto);
    Task<PersonnelDto> UpdateAsync(int id, PersonnelUpdateDto dto);
    Task<bool> DeleteAsync(int id);
    Task<IEnumerable<PersonnelDto>> GetActivePersonnelAsync();
    Task<IEnumerable<dynamic>> GetJobsForPersonnelAsync(int personnelId);
}
