using Acargroup.Domain.Enums;

namespace Acargroup.Application.DTOs;

public class JobDetailDto
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = null!;
    public string? CustomerEmail { get; set; }
    public string? CustomerPhone { get; set; }
    public int? AssignedPersonnelId { get; set; }
    public string? AssignedPersonnelName { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public JobStatus Status { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public decimal EstimatedCost { get; set; }
    public decimal? ActualCost { get; set; }
    public decimal? PaymentReceived { get; set; }
    public string? Notes { get; set; }
    
    // Enhanced fields
    public int Priority { get; set; }
    public DateTime? ScheduledDate { get; set; }
    public DateTime? PreferredDateStart { get; set; }
    public DateTime? PreferredDateEnd { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int? EstimatedHours { get; set; }
    public string? Address { get; set; }
    public string? ContactPerson { get; set; }
    public string? ContactPhone { get; set; }
    public List<string>? PhotoUrls { get; set; }
    public List<string>? RequiredMaterials { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Related data
    public List<JobHistoryDto> JobHistories { get; set; } = new();
    public List<JobChecklistDto> Checklists { get; set; } = new();
    public ScheduledJobDto? ScheduledJob { get; set; }
}

public class JobHistoryDto
{
    public int Id { get; set; }
    public JobStatus PreviousStatus { get; set; }
    public JobStatus NewStatus { get; set; }
    public string? Notes { get; set; }
    public string ChangedBy { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}

public class ScheduledJobDto
{
    public int Id { get; set; }
    public DateTime ScheduledStartTime { get; set; }
    public DateTime ScheduledEndTime { get; set; }
    public string? Location { get; set; }
    public string? ScheduleNotes { get; set; }
    public bool IsConfirmed { get; set; }
}
