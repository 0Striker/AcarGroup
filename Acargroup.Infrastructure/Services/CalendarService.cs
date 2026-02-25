using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Domain.Entities;
using Acargroup.Domain.Enums;
using Acargroup.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Acargroup.Infrastructure.Services;

public class CalendarService : ICalendarService
{
    private readonly AcargroupDbContext _context;

    public CalendarService(AcargroupDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CalendarEventDto>> GetScheduledJobsAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = _context.ScheduledJobs
            .Include(s => s.Job)
            .ThenInclude(j => j.Customer)
            .Include(s => s.Job)
            .ThenInclude(j => j.AssignedPersonnel)
            .AsQueryable();

        if (startDate.HasValue)
            query = query.Where(s => s.ScheduledStartTime >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(s => s.ScheduledEndTime <= endDate.Value);

        var scheduledJobs = await query.ToListAsync();

        return scheduledJobs.Select(MapToEventDto);
    }

    public async Task<IEnumerable<CalendarEventDto>> GetScheduledJobsByPersonnelAsync(int personnelId, DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = _context.ScheduledJobs
            .Include(s => s.Job)
            .ThenInclude(j => j.Customer)
            .Include(s => s.Job)
            .ThenInclude(j => j.AssignedPersonnel)
            .Where(s => s.Job.AssignedPersonnelId == personnelId)
            .AsQueryable();

        if (startDate.HasValue)
            query = query.Where(s => s.ScheduledStartTime >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(s => s.ScheduledEndTime <= endDate.Value);

        var scheduledJobs = await query.ToListAsync();

        return scheduledJobs.Select(MapToEventDto);
    }

    public async Task<CalendarEventDto> ScheduleJobAsync(ScheduledJobCreateDto dto)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var job = await _context.Jobs.FindAsync(dto.JobId);
            if (job == null)
                throw new KeyNotFoundException($"Job with ID {dto.JobId} not found.");

            // Check if already scheduled
            var existingSchedule = await _context.ScheduledJobs.FirstOrDefaultAsync(s => s.JobId == dto.JobId);
            if (existingSchedule != null)
                throw new InvalidOperationException("Job is already scheduled. Use UpdateScheduleAsync instead.");

            var schedule = new ScheduledJob
            {
                JobId = dto.JobId,
                ScheduledStartTime = dto.ScheduledStartTime,
                ScheduledEndTime = dto.ScheduledEndTime,
                Location = dto.Location,
                ScheduleNotes = dto.ScheduleNotes,
                IsConfirmed = false
            };

            _context.ScheduledJobs.Add(schedule);
            
            // Update job status if needed
            if (job.Status == JobStatus.Pending)
            {
                job.Status = JobStatus.Scheduled;
                _context.JobHistories.Add(new JobHistory
                {
                    JobId = job.Id,
                    PreviousStatus = JobStatus.Pending,
                    NewStatus = JobStatus.Scheduled,
                    Notes = "Automatically scheduled via Calendar",
                    ChangedBy = "System",
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // Reload for DTO
            await _context.Entry(schedule).Reference(s => s.Job).LoadAsync();
            await _context.Entry(schedule.Job).Reference(j => j.Customer).LoadAsync();
            await _context.Entry(schedule.Job).Reference(j => j.AssignedPersonnel).LoadAsync();

            return MapToEventDto(schedule);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> UpdateScheduleAsync(int scheduleId, ScheduledJobCreateDto dto)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var schedule = await _context.ScheduledJobs.FindAsync(scheduleId);
            if (schedule == null) return false;

            schedule.ScheduledStartTime = dto.ScheduledStartTime;
            schedule.ScheduledEndTime = dto.ScheduledEndTime;
            schedule.Location = dto.Location;
            schedule.ScheduleNotes = dto.ScheduleNotes;
            schedule.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return true;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> ConfirmScheduleAsync(int scheduleId)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var schedule = await _context.ScheduledJobs.FindAsync(scheduleId);
            if (schedule == null) return false;

            schedule.IsConfirmed = true;
            schedule.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return true;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> CancelScheduleAsync(int scheduleId)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var schedule = await _context.ScheduledJobs.FindAsync(scheduleId);
            if (schedule == null) return false;

            _context.ScheduledJobs.Remove(schedule);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return true;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private static CalendarEventDto MapToEventDto(ScheduledJob schedule)
    {
        return new CalendarEventDto
        {
            Id = schedule.Id, // This is the Schedule ID, not Job ID
            Title = schedule.Job.Title,
            Start = schedule.ScheduledStartTime,
            End = schedule.ScheduledEndTime,
            CustomerName = schedule.Job.Customer?.FullName ?? "Unknown",
            PersonnelName = schedule.Job.AssignedPersonnel?.FullName,
            Status = schedule.Job.Status.ToString(),
            Location = schedule.Location,
            IsConfirmed = schedule.IsConfirmed
        };
    }
}
