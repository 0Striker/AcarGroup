using Acargroup.Domain.Common;
using Acargroup.Domain.Enums;

namespace Acargroup.Domain.Entities;

public class Job : BaseEntity
{
    public int CustomerId { get; set; }
    public int? AssignedPersonnelId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public JobStatus Status { get; set; } = JobStatus.Pending;
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.None;
    public decimal EstimatedCost { get; set; }
    public decimal? ActualCost { get; set; }
    public decimal? PaymentReceived { get; set; } // Payment collected by personnel
    public string? Notes { get; set; }
    
    // Enhanced tracking fields
    public int Priority { get; set; } = 2; // 1: Low, 2: Normal, 3: High, 4: Urgent
    public DateTime? ScheduledDate { get; set; }
    public DateTime? PreferredDateStart { get; set; } // Customer's preferred start date
    public DateTime? PreferredDateEnd { get; set; }   // Customer's preferred end date
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int? EstimatedHours { get; set; }
    
    // Contact information
    public string? Address { get; set; }
    public string? ContactPerson { get; set; }
    public string? ContactPhone { get; set; }
    
    // JSON arrays stored as strings
    public string? PhotoUrls { get; set; } // JSON array of photo URLs
    public string? RequiredMaterials { get; set; } // JSON array of materials
    
    // Navigation properties
    public Customer Customer { get; set; } = null!;
    public Personnel? AssignedPersonnel { get; set; }
    public ICollection<JobHistory> JobHistories { get; set; } = new List<JobHistory>();
    public ICollection<FinanceTransaction> FinanceTransactions { get; set; } = new List<FinanceTransaction>();
    public ScheduledJob? ScheduledJob { get; set; }
    public ICollection<JobChecklist> JobChecklists { get; set; } = new List<JobChecklist>();
}
