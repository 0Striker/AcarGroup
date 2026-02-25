using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Domain.Entities;
using Acargroup.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Acargroup.Infrastructure.Services;

public class ReminderService : IReminderService
{
    private readonly AcargroupDbContext _context;

    public ReminderService(AcargroupDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ReminderDto>> GetAllAsync()
    {
        return await _context.Reminders
            .Select(r => new ReminderDto
            {
                Id = r.Id,
                Title = r.Title,
                ReminderDate = r.ReminderDate,
                UserId = r.UserId,
                CreatedAt = r.CreatedAt,
                IsCompleted = r.IsCompleted
            })
            .ToListAsync();
    }

    public async Task<ReminderDto?> GetByIdAsync(int id)
    {
        var reminder = await _context.Reminders.FindAsync(id);
        if (reminder == null) return null;

        return new ReminderDto
        {
            Id = reminder.Id,
            Title = reminder.Title,
            ReminderDate = reminder.ReminderDate,
            UserId = reminder.UserId,
            CreatedAt = reminder.CreatedAt,
            IsCompleted = reminder.IsCompleted
        };
    }

    public async Task<ReminderDto> CreateAsync(ReminderCreateDto dto, int userId)
    {
        var reminder = new Reminder
        {
            Title = dto.Title,
            ReminderDate = dto.ReminderDate,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            IsCompleted = false
        };

        _context.Reminders.Add(reminder);
        await _context.SaveChangesAsync();

        return new ReminderDto
        {
            Id = reminder.Id,
            Title = reminder.Title,
            ReminderDate = reminder.ReminderDate,
            UserId = reminder.UserId,
            CreatedAt = reminder.CreatedAt,
            IsCompleted = reminder.IsCompleted
        };
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var reminder = await _context.Reminders.FindAsync(id);
        if (reminder == null) return false;

        _context.Reminders.Remove(reminder);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ToggleCompleteAsync(int id)
    {
        var reminder = await _context.Reminders.FindAsync(id);
        if (reminder == null) return false;

        reminder.IsCompleted = !reminder.IsCompleted;
        await _context.SaveChangesAsync();
        return true;
    }
}
