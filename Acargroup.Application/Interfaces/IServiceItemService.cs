using Acargroup.Application.DTOs;

namespace Acargroup.Application.Interfaces;

public interface IServiceItemService
{
    Task<ServiceItemResponseDto> CreateAsync(int customerId, ServiceItemCreateDto dto, string? photoPath);
    Task<List<ServiceItemResponseDto>> GetByCustomerAsync(int customerId);
    Task<List<ServiceItemDetailDto>> GetAllAsync(string? status, string? search);
    Task<ServiceItemDetailDto?> GetDetailAsync(int id);
    Task UpdateStatusAsync(int id, string status, string? note, string adminName);
    Task AddAdminNoteAsync(int id, string note, string adminName);
}
