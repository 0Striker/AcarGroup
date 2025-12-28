using Acargroup.Application.DTOs;
using Acargroup.Domain.Enums;

namespace Acargroup.Application.Interfaces;

public interface IJobService
{
    Task<IEnumerable<JobDto>> GetAllAsync();
    Task<IEnumerable<JobDto>> GetByPersonnelAsync(int personnelId);
    Task<IEnumerable<JobDto>> GetByCustomerAsync(int customerId);
    Task<JobDto?> GetByIdAsync(int id);
    Task<JobDto> CreateAsync(JobCreateDto dto);
    Task<JobDto> UpdateAsync(int id, JobUpdateDto dto);
    Task<bool> DeleteAsync(int id);
    Task<JobDto> AssignPersonnelAsync(int jobId, JobAssignDto dto);
    Task<JobDto> ChangeStatusAsync(int jobId, JobStatusChangeDto dto, string changedBy);
    Task<JobDto> UpdatePaymentStatusAsync(int jobId, PaymentStatus paymentStatus);
    Task<IEnumerable<JobDto>> GetJobsByStatusAsync(JobStatus status);
    
    // New methods for enhanced features
    Task<JobDetailDto?> GetDetailAsync(int jobId);
    Task<IEnumerable<JobDto>> GetFilteredAsync(JobFilterDto filter);
    Task<JobDto> AddPhotoAsync(int jobId, string photoUrl);
    Task<JobDto> UpdateScheduleAsync(int jobId, DateTime scheduledDate);
    Task<JobDto> RecordPaymentAsync(int jobId, decimal amount);
}
