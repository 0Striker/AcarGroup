using Acargroup.Application.DTOs;

namespace Acargroup.Application.Interfaces;

public interface IHistoryService
{
    Task<IEnumerable<HistoryDto>> GetAllAsync();
    Task<HistoryDto?> GetByIdAsync(int id);
    Task<HistoryDto> AddAsync(HistoryCreateUpdateDto dto);
    Task UpdateAsync(int id, HistoryCreateUpdateDto dto);
    Task DeleteAsync(int id);
}
