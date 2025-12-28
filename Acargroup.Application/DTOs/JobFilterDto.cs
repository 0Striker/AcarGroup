using Acargroup.Domain.Enums;

namespace Acargroup.Application.DTOs;

public class JobFilterDto
{
    public List<JobStatus>? Statuses { get; set; }
    public List<int>? PersonnelIds { get; set; }
    public int? CustomerId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public List<int>? Priorities { get; set; }
    public string? SearchQuery { get; set; } // Title, customer name, description
    public List<PaymentStatus>? PaymentStatuses { get; set; }
}
