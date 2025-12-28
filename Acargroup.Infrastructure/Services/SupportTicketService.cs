using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Domain.Entities;
using Acargroup.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Acargroup.Infrastructure.Services;

public class SupportTicketService : ISupportTicketService
{
    private readonly AcargroupDbContext _context;

    public SupportTicketService(AcargroupDbContext context)
    {
        _context = context;
    }

    public async Task<SupportTicketDetailDto> CreateAsync(int customerId, SupportTicketCreateDto dto, string? imagePath = null)
    {
        // Verify customer and address exist
        var address = await _context.CustomerAddresses
            .FirstOrDefaultAsync(a => a.Id == dto.CustomerAddressId && a.CustomerId == customerId);
        if (address == null)
        {
            throw new InvalidOperationException("Geçerli bir adres seçmelisiniz.");
        }

        var ticket = new SupportTicket
        {
            CustomerId = customerId,
            CustomerAddressId = address.Id,
            Title = dto.Title,
            Description = dto.Description,
            ProductName = dto.ProductName,
            SerialNumber = dto.SerialNumber,
            ImagePath = imagePath,
            Status = "Open",
            CreatedAt = DateTime.UtcNow,
            CustomerAddress = address
        };

        _context.SupportTickets.Add(ticket);
        await _context.SaveChangesAsync();

        return MapToDetailDto(ticket);
    }

    public async Task<List<SupportTicketListDto>> GetByCustomerAsync(int customerId, string? status = null)
    {
        var query = _context.SupportTickets
            .Include(t => t.CustomerAddress)
            .Where(t => t.CustomerId == customerId);

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(t => t.Status == status);
        }

        var tickets = await query
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return tickets.Select(MapToListDto).ToList();
    }

    public async Task<SupportTicketDetailDto?> GetByIdForCustomerAsync(int customerId, int ticketId)
    {
        var ticket = await _context.SupportTickets
            .Include(t => t.CustomerAddress)
            .FirstOrDefaultAsync(t => t.Id == ticketId && t.CustomerId == customerId);

        return ticket != null ? MapToDetailDto(ticket) : null;
    }

    public async Task<List<SupportTicketListDto>> GetAllAsync(string? status = null)
    {
        var query = _context.SupportTickets
            .Include(t => t.CustomerAddress)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(t => t.Status == status);
        }

        var tickets = await query
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return tickets.Select(MapToListDto).ToList();
    }

    public async Task UpdateStatusAsync(int ticketId, string status)
    {
        var ticket = await _context.SupportTickets.FindAsync(ticketId);
        if (ticket == null)
        {
            throw new InvalidOperationException("Arıza kaydı bulunamadı.");
        }

        ticket.Status = status;
        ticket.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    private static SupportTicketListDto MapToListDto(SupportTicket ticket)
    {
        return new SupportTicketListDto
        {
            Id = ticket.Id,
            CustomerAddressId = ticket.CustomerAddressId,
            AddressLabel = ticket.CustomerAddress?.Label,
            Title = ticket.Title,
            Status = ticket.Status,
            CreatedAt = ticket.CreatedAt,
            ProductName = ticket.ProductName,
            SerialNumber = ticket.SerialNumber
        };
    }

    private static SupportTicketDetailDto MapToDetailDto(SupportTicket ticket)
    {
        return new SupportTicketDetailDto
        {
            Id = ticket.Id,
            CustomerAddressId = ticket.CustomerAddressId,
            AddressLabel = ticket.CustomerAddress?.Label,
            Title = ticket.Title,
            Description = ticket.Description,
            Status = ticket.Status,
            CreatedAt = ticket.CreatedAt,
            UpdatedAt = ticket.UpdatedAt,
            ProductName = ticket.ProductName,
            SerialNumber = ticket.SerialNumber,
            ImageUrl = ticket.ImagePath // Will be converted to full URL in controller
        };
    }
}
