using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Domain.Entities;
using Acargroup.Domain.Enums;
using Acargroup.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Acargroup.Infrastructure.Services;

public class JobService : IJobService
{
    private readonly AcargroupDbContext _context;
    private readonly IFinanceService _financeService; // Injected for balance updates

    public JobService(AcargroupDbContext context, IFinanceService financeService)
    {
        _context = context;
        _financeService = financeService;
    }

    public async Task<IEnumerable<JobDto>> GetAllAsync()
    {
        var jobs = await _context.Jobs
            .Include(j => j.Customer)
            .Include(j => j.AssignedPersonnel)
            .OrderByDescending(j => j.CreatedAt)
            .ToListAsync();

        return jobs.Select(MapToDto);
    }

    public async Task<IEnumerable<JobDto>> GetByPersonnelAsync(int personnelId)
    {
        var jobs = await _context.Jobs
            .Include(j => j.Customer)
            .Include(j => j.AssignedPersonnel)
            .Where(j => j.AssignedPersonnelId == personnelId)
            .OrderByDescending(j => j.CreatedAt)
            .ToListAsync();

        return jobs.Select(MapToDto);
    }

    public async Task<IEnumerable<JobDto>> GetByCustomerAsync(int customerId)
    {
        var jobs = await _context.Jobs
            .Include(j => j.Customer)
            .Include(j => j.AssignedPersonnel)
            .Where(j => j.CustomerId == customerId)
            .OrderByDescending(j => j.CreatedAt)
            .ToListAsync();

        return jobs.Select(MapToDto);
    }

    public async Task<JobDto?> GetByIdAsync(int id)
    {
        var job = await _context.Jobs
            .Include(j => j.Customer)
            .Include(j => j.AssignedPersonnel)
            .Include(j => j.JobHistories) // Include history
            .FirstOrDefaultAsync(j => j.Id == id);

        return job == null ? null : MapToDto(job);
    }

    public async Task<JobDto> CreateAsync(JobCreateDto dto)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var job = new Job
            {
                CustomerId = dto.CustomerId,
                Title = dto.Title,
                Description = dto.Description,
                EstimatedCost = dto.EstimatedCost,
                Notes = dto.Notes,
                AssignedPersonnelId = dto.AssignedPersonnelId,
                Status = JobStatus.Pending,
                PaymentStatus = PaymentStatus.None,
                Priority = dto.Priority,
                ScheduledDate = dto.ScheduledDate,
                PreferredDateStart = dto.PreferredDateStart,
                PreferredDateEnd = dto.PreferredDateEnd,
                EstimatedHours = dto.EstimatedHours,
                Address = dto.Address,
                ContactPerson = dto.ContactPerson,
                ContactPhone = dto.ContactPhone,
                RequiredMaterials = dto.RequiredMaterials != null && dto.RequiredMaterials.Any()
                    ? System.Text.Json.JsonSerializer.Serialize(dto.RequiredMaterials)
                    : null,
                CreatedAt = DateTime.UtcNow
            };

            _context.Jobs.Add(job);
            await _context.SaveChangesAsync();

            // Auto-create finance transaction if estimated cost > 0
            if (job.EstimatedCost > 0)
            {
                var financeTransaction = new FinanceTransaction
                {
                    CustomerId = job.CustomerId,
                    JobId = job.Id,
                    Type = TransactionType.Expense, // Customer owes money (alacak)
                    Amount = job.EstimatedCost,
                    Description = $"İş: {job.Title}",
                    ReferenceNumber = $"JOB-{job.Id}",
                    CreatedAt = DateTime.UtcNow
                };

                _context.FinanceTransactions.Add(financeTransaction);
                await _context.SaveChangesAsync();

                // Update customer balance
                await _financeService.UpdateCustomerBalanceAsync(job.CustomerId);
            }

            await transaction.CommitAsync();

            await _context.Entry(job).Reference(j => j.Customer).LoadAsync();
            return MapToDto(job);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<JobDto> UpdateAsync(int id, JobUpdateDto dto)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var job = await _context.Jobs
                .Include(j => j.Customer)
                .Include(j => j.AssignedPersonnel)
                .FirstOrDefaultAsync(j => j.Id == id);

            if (job == null)
                throw new KeyNotFoundException($"Job with ID {id} not found.");

            job.Title = dto.Title;
            job.Description = dto.Description;
            job.EstimatedCost = dto.EstimatedCost;
            job.ActualCost = dto.ActualCost;
            job.Notes = dto.Notes;
            job.Priority = dto.Priority;
            job.ScheduledDate = dto.ScheduledDate;
            job.EstimatedHours = dto.EstimatedHours;
            job.Address = dto.Address;
            job.ContactPerson = dto.ContactPerson;
            job.ContactPhone = dto.ContactPhone;
            job.RequiredMaterials = dto.RequiredMaterials != null && dto.RequiredMaterials.Any()
                ? System.Text.Json.JsonSerializer.Serialize(dto.RequiredMaterials)
                : null;
            job.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return MapToDto(job);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> DeleteAsync(int id)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var job = await _context.Jobs.FindAsync(id);
            if (job == null) return false;

            _context.Jobs.Remove(job);
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

    public async Task<JobDto> AssignPersonnelAsync(int jobId, JobAssignDto dto)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var job = await _context.Jobs
                .Include(j => j.Customer)
                .Include(j => j.AssignedPersonnel)
                .FirstOrDefaultAsync(j => j.Id == jobId);

            if (job == null)
                throw new KeyNotFoundException($"Job with ID {jobId} not found.");

            job.AssignedPersonnelId = dto.PersonnelId;
            job.UpdatedAt = DateTime.UtcNow;

            // Auto-update status to Scheduled if it was Pending
            if (job.Status == JobStatus.Pending)
            {
                var oldStatus = job.Status;
                job.Status = JobStatus.Scheduled;

                _context.JobHistories.Add(new JobHistory
                {
                    JobId = jobId,
                    PreviousStatus = oldStatus,
                    NewStatus = JobStatus.Scheduled,
                    Notes = "Personel ataması yapıldı, otomatik olarak planlandı.",
                    ChangedBy = "System",
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            await _context.Entry(job).Reference(j => j.AssignedPersonnel).LoadAsync();
            return MapToDto(job);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<JobDto> ChangeStatusAsync(int jobId, JobStatusChangeDto dto, string changedBy)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var job = await _context.Jobs
                .Include(j => j.Customer)
                .Include(j => j.AssignedPersonnel)
                .FirstOrDefaultAsync(j => j.Id == jobId);

            if (job == null)
                throw new KeyNotFoundException($"Job with ID {jobId} not found.");

            var oldStatus = job.Status;
            job.Status = dto.NewStatus;
            job.UpdatedAt = DateTime.UtcNow;

            _context.JobHistories.Add(new JobHistory
            {
                JobId = jobId,
                PreviousStatus = oldStatus,
                NewStatus = dto.NewStatus,
                Notes = dto.Notes,
                ChangedBy = changedBy,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return MapToDto(job);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<JobDto> UpdatePaymentStatusAsync(int jobId, PaymentStatus paymentStatus)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var job = await _context.Jobs
                .Include(j => j.Customer)
                .Include(j => j.AssignedPersonnel)
                .FirstOrDefaultAsync(j => j.Id == jobId);

            if (job == null)
                throw new KeyNotFoundException($"Job with ID {jobId} not found.");

            var oldPaymentStatus = job.PaymentStatus;
            job.PaymentStatus = paymentStatus;
            job.UpdatedAt = DateTime.UtcNow;

            // Auto-create FinanceTransaction if marked as Paid and wasn't Paid before
            if (paymentStatus == PaymentStatus.Paid && oldPaymentStatus != PaymentStatus.Paid)
            {
                var amount = job.ActualCost.GetValueOrDefault() > 0 ? job.ActualCost.GetValueOrDefault() : job.EstimatedCost;
                
                var financeTransaction = new FinanceTransaction
                {
                    CustomerId = job.CustomerId,
                    JobId = job.Id,
                    Type = TransactionType.Income, // Income for the company
                    Amount = amount,
                    Description = $"İş ödemesi alındı: {job.Title}",
                    Notes = "Otomatik oluşturuldu (Ödeme Durumu: Ödendi)",
                    CreatedAt = DateTime.UtcNow
                };

                _context.FinanceTransactions.Add(financeTransaction);
                await _context.SaveChangesAsync();

                // Update customer balance
                // Since we are in a transaction, we can call the service method if it doesn't create its own transaction,
                // OR we can just duplicate the logic here or call a shared private method.
                // Calling _financeService.UpdateCustomerBalanceAsync might be safe if it just does DB operations.
                // However, to be safe and atomic within THIS transaction, let's do the balance update logic here manually or ensure FinanceService joins the transaction.
                // EF Core uses the same DbContext instance in Scoped, so the transaction is shared.
                
                await _financeService.UpdateCustomerBalanceAsync(job.CustomerId);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return MapToDto(job);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<IEnumerable<JobDto>> GetJobsByStatusAsync(JobStatus status)
    {
        var jobs = await _context.Jobs
            .Include(j => j.Customer)
            .Include(j => j.AssignedPersonnel)
            .Where(j => j.Status == status)
            .OrderByDescending(j => j.CreatedAt)
            .ToListAsync();

        return jobs.Select(MapToDto);
    }

    public async Task<JobDetailDto?> GetDetailAsync(int jobId)
    {
        var job = await _context.Jobs
            .Include(j => j.Customer)
            .Include(j => j.AssignedPersonnel)
            .Include(j => j.JobHistories)
            .Include(j => j.JobChecklists)
            .Include(j => j.ScheduledJob)
            .FirstOrDefaultAsync(j => j.Id == jobId);

        if (job == null) return null;

        return new JobDetailDto
        {
            Id = job.Id,
            CustomerId = job.CustomerId,
            CustomerName = job.Customer.FullName,
            CustomerEmail = job.Customer.Email,
            CustomerPhone = job.Customer.Phone,
            AssignedPersonnelId = job.AssignedPersonnelId,
            AssignedPersonnelName = job.AssignedPersonnel?.FullName,
            Title = job.Title,
            Description = job.Description,
            Status = job.Status,
            PaymentStatus = job.PaymentStatus,
            EstimatedCost = job.EstimatedCost,
            ActualCost = job.ActualCost,
            PaymentReceived = job.PaymentReceived,
            Notes = job.Notes,
            Priority = job.Priority,
            ScheduledDate = job.ScheduledDate,
            StartedAt = job.StartedAt,
            CompletedAt = job.CompletedAt,
            EstimatedHours = job.EstimatedHours,
            Address = job.Address,
            ContactPerson = job.ContactPerson,
            ContactPhone = job.ContactPhone,
            PhotoUrls = string.IsNullOrEmpty(job.PhotoUrls) ? null : System.Text.Json.JsonSerializer.Deserialize<List<string>>(job.PhotoUrls),
            RequiredMaterials = string.IsNullOrEmpty(job.RequiredMaterials) ? null : System.Text.Json.JsonSerializer.Deserialize<List<string>>(job.RequiredMaterials),
            CreatedAt = job.CreatedAt,
            UpdatedAt = job.UpdatedAt,
            JobHistories = job.JobHistories.Select(h => new JobHistoryDto
            {
                Id = h.Id,
                PreviousStatus = h.PreviousStatus,
                NewStatus = h.NewStatus,
                Notes = h.Notes,
                ChangedBy = h.ChangedBy,
                CreatedAt = h.CreatedAt
            }).OrderByDescending(h => h.CreatedAt).ToList(),
            Checklists = job.JobChecklists.Select(c => new JobChecklistDto
            {
                Id = c.Id,
                JobId = c.JobId,
                Title = c.Title,
                IsCompleted = c.IsCompleted,
                DisplayOrder = c.DisplayOrder,
                CompletedAt = c.CompletedAt,
                CompletedByPersonnelId = c.CompletedByPersonnelId
            }).OrderBy(c => c.DisplayOrder).ToList(),
            ScheduledJob = job.ScheduledJob == null ? null : new ScheduledJobDto
            {
                Id = job.ScheduledJob.Id,
                ScheduledStartTime = job.ScheduledJob.ScheduledStartTime,
                ScheduledEndTime = job.ScheduledJob.ScheduledEndTime,
                Location = job.ScheduledJob.Location,
                ScheduleNotes = job.ScheduledJob.ScheduleNotes,
                IsConfirmed = job.ScheduledJob.IsConfirmed
            }
        };
    }

    public async Task<IEnumerable<JobDto>> GetFilteredAsync(JobFilterDto filter)
    {
        var query = _context.Jobs
            .Include(j => j.Customer)
            .Include(j => j.AssignedPersonnel)
            .AsQueryable();

        // Apply filters
        if (filter.Statuses != null && filter.Statuses.Any())
            query = query.Where(j => filter.Statuses.Contains(j.Status));

        if (filter.PersonnelIds != null && filter.PersonnelIds.Any())
            query = query.Where(j => j.AssignedPersonnelId.HasValue && filter.PersonnelIds.Contains(j.AssignedPersonnelId.Value));

        if (filter.CustomerId.HasValue)
            query = query.Where(j => j.CustomerId == filter.CustomerId.Value);

        if (filter.StartDate.HasValue)
            query = query.Where(j => j.CreatedAt >= filter.StartDate.Value);

        if (filter.EndDate.HasValue)
            query = query.Where(j => j.CreatedAt <= filter.EndDate.Value);

        if (filter.Priorities != null && filter.Priorities.Any())
            query = query.Where(j => filter.Priorities.Contains(j.Priority));

        if (!string.IsNullOrWhiteSpace(filter.SearchQuery))
        {
            var searchTerm = filter.SearchQuery.ToLower();
            query = query.Where(j =>
                j.Title.ToLower().Contains(searchTerm) ||
                j.Description.ToLower().Contains(searchTerm) ||
                j.Customer.FullName.ToLower().Contains(searchTerm));
        }

        if (filter.PaymentStatuses != null && filter.PaymentStatuses.Any())
            query = query.Where(j => filter.PaymentStatuses.Contains(j.PaymentStatus));

        var jobs = await query.OrderByDescending(j => j.CreatedAt).ToListAsync();
        return jobs.Select(MapToDto);
    }

    public async Task<JobDto> AddPhotoAsync(int jobId, string photoUrl)
    {
        var job = await _context.Jobs
            .Include(j => j.Customer)
            .Include(j => j.AssignedPersonnel)
            .FirstOrDefaultAsync(j => j.Id == jobId);

        if (job == null)
            throw new KeyNotFoundException($"Job with ID {jobId} not found.");

        var photoUrls = string.IsNullOrEmpty(job.PhotoUrls)
            ? new List<string>()
            : System.Text.Json.JsonSerializer.Deserialize<List<string>>(job.PhotoUrls) ?? new List<string>();

        photoUrls.Add(photoUrl);
        job.PhotoUrls = System.Text.Json.JsonSerializer.Serialize(photoUrls);
        job.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(job);
    }

    public async Task<JobDto> UpdateScheduleAsync(int jobId, DateTime scheduledDate)
    {
        var job = await _context.Jobs
            .Include(j => j.Customer)
            .Include(j => j.AssignedPersonnel)
            .FirstOrDefaultAsync(j => j.Id == jobId);

        if (job == null)
            throw new KeyNotFoundException($"Job with ID {jobId} not found.");

        job.ScheduledDate = scheduledDate;
        job.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(job);
    }

    public async Task<JobDto> RecordPaymentAsync(int jobId, decimal amount)
    {
        var job = await _context.Jobs
            .Include(j => j.Customer)
            .Include(j => j.AssignedPersonnel)
            .FirstOrDefaultAsync(j => j.Id == jobId);

        if (job == null)
            throw new KeyNotFoundException($"Job with ID {jobId} not found.");

        job.PaymentReceived = amount;
        job.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(job);
    }

    private static JobDto MapToDto(Job job)
    {
        return new JobDto
        {
            Id = job.Id,
            CustomerId = job.CustomerId,
            CustomerName = job.Customer?.FullName ?? "Unknown",
            AssignedPersonnelId = job.AssignedPersonnelId,
            AssignedPersonnelName = job.AssignedPersonnel?.FullName,
            Title = job.Title,
            Description = job.Description,
            Status = job.Status,
            PaymentStatus = job.PaymentStatus,
            EstimatedCost = job.EstimatedCost,
            ActualCost = job.ActualCost,
            PaymentReceived = job.PaymentReceived,
            Notes = job.Notes,
            Priority = job.Priority,
            ScheduledDate = job.ScheduledDate,
            StartedAt = job.StartedAt,
            CompletedAt = job.CompletedAt,
            EstimatedHours = job.EstimatedHours,
            Address = job.Address,
            ContactPerson = job.ContactPerson,
            ContactPhone = job.ContactPhone,
            PhotoUrls = string.IsNullOrEmpty(job.PhotoUrls) ? null : System.Text.Json.JsonSerializer.Deserialize<List<string>>(job.PhotoUrls),
            RequiredMaterials = string.IsNullOrEmpty(job.RequiredMaterials) ? null : System.Text.Json.JsonSerializer.Deserialize<List<string>>(job.RequiredMaterials),
            CreatedAt = job.CreatedAt,
            UpdatedAt = job.UpdatedAt
        };
    }
}
