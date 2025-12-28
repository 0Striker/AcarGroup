using Acargroup.Application.DTOs;

namespace Acargroup.Application.Interfaces;

public interface ISupportTicketService
{
    Task<SupportTicketDetailDto> CreateAsync(int customerId, SupportTicketCreateDto dto, string? imagePath = null);
    Task<List<SupportTicketListDto>> GetByCustomerAsync(int customerId, string? status = null);
    Task<SupportTicketDetailDto?> GetByIdForCustomerAsync(int customerId, int ticketId);
    Task<List<SupportTicketListDto>> GetAllAsync(string? status = null);
    Task UpdateStatusAsync(int ticketId, string status);
}
