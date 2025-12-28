using System.Linq;
using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Domain.Entities;
using Acargroup.Domain.Enums;
using Acargroup.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Acargroup.Infrastructure.Services;

public class ServiceItemService : IServiceItemService
{
    private readonly AcargroupDbContext _context;

    public ServiceItemService(AcargroupDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceItemResponseDto> CreateAsync(int customerId, ServiceItemCreateDto dto, string? photoPath)
    {
        var customerExists = await _context.Customers.AnyAsync(c => c.Id == customerId);
        if (!customerExists)
        {
            throw new InvalidOperationException("Müşteri bulunamadı.");
        }

        var serviceItem = new ServiceItem
        {
            CustomerId = customerId,
            Title = dto.Title,
            Description = dto.Description,
            Status = ServiceItemStatus.Pending.ToString(),
            PhotoPath = photoPath,
            CreatedAt = DateTime.UtcNow
        };

        _context.ServiceItems.Add(serviceItem);
        await _context.SaveChangesAsync();

        await AddHistoryAsync(serviceItem.Id, serviceItem.Status, "Talep oluşturuldu.", "Customer");
        return MapToResponse(serviceItem);
    }

    public async Task<List<ServiceItemResponseDto>> GetByCustomerAsync(int customerId)
    {
        var items = await _context.ServiceItems
            .Where(i => i.CustomerId == customerId)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();

        return items.Select(MapToResponse).ToList();
    }

    public async Task<List<ServiceItemDetailDto>> GetAllAsync(string? status, string? search)
    {
        var query = _context.ServiceItems
            .Include(i => i.Customer)
            .Include(i => i.StatusHistories)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(i => i.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(i =>
                i.Title.ToLower().Contains(search.ToLower()) ||
                i.Customer.FullName.ToLower().Contains(search.ToLower()) ||
                i.Customer.Email.ToLower().Contains(search.ToLower()));
        }

        var items = await query.OrderByDescending(i => i.CreatedAt).ToListAsync();
        return items.Select(MapToDetail).ToList();
    }

    public async Task<ServiceItemDetailDto?> GetDetailAsync(int id)
    {
        var item = await _context.ServiceItems
            .Include(i => i.Customer)
            .Include(i => i.StatusHistories)
            .FirstOrDefaultAsync(i => i.Id == id);

        return item == null ? null : MapToDetail(item);
    }

    public async Task UpdateStatusAsync(int id, string status, string? note, string adminName)
    {
        var normalizedStatus = NormalizeStatus(status);
        var item = await _context.ServiceItems.FindAsync(id);
        if (item == null)
        {
            throw new InvalidOperationException("Servis kaydı bulunamadı.");
        }

        item.Status = normalizedStatus;
        item.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        await AddHistoryAsync(id, normalizedStatus, note, adminName);
    }

    public async Task AddAdminNoteAsync(int id, string note, string adminName)
    {
        var item = await _context.ServiceItems.FindAsync(id);
        if (item == null)
        {
            throw new InvalidOperationException("Servis kaydı bulunamadı.");
        }

        item.AdminNote = string.IsNullOrWhiteSpace(item.AdminNote)
            ? note
            : $"{item.AdminNote}\n{note}";
        item.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        await AddHistoryAsync(id, item.Status, note, adminName);
    }

    private async Task AddHistoryAsync(int serviceItemId, string status, string? note, string changedBy)
    {
        var history = new ServiceItemStatusHistory
        {
            ServiceItemId = serviceItemId,
            Status = status,
            Note = note,
            ChangedBy = changedBy,
            CreatedAt = DateTime.UtcNow
        };

        _context.ServiceItemStatusHistories.Add(history);
        await _context.SaveChangesAsync();
    }

    private static ServiceItemResponseDto MapToResponse(ServiceItem item)
    {
        return new ServiceItemResponseDto
        {
            Id = item.Id,
            Title = item.Title,
            Description = item.Description,
            Status = item.Status,
            CreatedAt = item.CreatedAt,
            UpdatedAt = item.UpdatedAt,
            AdminNote = item.AdminNote,
            PhotoPath = item.PhotoPath
        };
    }

    private static ServiceItemDetailDto MapToDetail(ServiceItem item)
    {
        return new ServiceItemDetailDto
        {
            Id = item.Id,
            Title = item.Title,
            Description = item.Description,
            Status = item.Status,
            CreatedAt = item.CreatedAt,
            UpdatedAt = item.UpdatedAt,
            AdminNote = item.AdminNote,
            PhotoPath = item.PhotoPath,
            CustomerName = item.Customer.FullName,
            CustomerEmail = item.Customer.Email,
            CustomerPhone = item.Customer.Phone,
            History = item.StatusHistories
                .OrderByDescending(h => h.CreatedAt)
                .Select(h => new ServiceItemStatusHistoryDto
                {
                    Status = h.Status,
                    Note = h.Note,
                    ChangedBy = h.ChangedBy,
                    CreatedAt = h.CreatedAt
                })
                .ToList()
        };
    }

    private static string NormalizeStatus(string status)
    {
        if (Enum.TryParse<ServiceItemStatus>(status, true, out var parsed))
        {
            return parsed.ToString();
        }

        throw new InvalidOperationException("Geçersiz durum değeri.");
    }
}
