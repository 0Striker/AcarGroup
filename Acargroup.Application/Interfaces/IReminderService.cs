using Acargroup.Application.DTOs;

namespace Acargroup.Application.Interfaces;

public interface IReminderService
{
    Task<IEnumerable<ReminderDto>> GetAllAsync();
    Task<ReminderDto?> GetByIdAsync(int id);
    Task<ReminderDto> CreateAsync(ReminderCreateDto dto, int userId);
    Task<bool> DeleteAsync(int id);
    Task<bool> ToggleCompleteAsync(int id);
}
