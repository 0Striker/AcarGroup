using Acargroup.Domain.Common;
using Acargroup.Domain.Enums;

namespace Acargroup.Domain.Entities;

public class JobHistory : BaseEntity
{
    public int JobId { get; set; }
    public JobStatus PreviousStatus { get; set; }
    public JobStatus NewStatus { get; set; }
    public string? Notes { get; set; }
    public string ChangedBy { get; set; } = null!; // User email or name
    
    // Navigation property
    public Job Job { get; set; } = null!;
}
