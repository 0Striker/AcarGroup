using Acargroup.Domain.Common;

namespace Acargroup.Domain.Entities;

public class ScheduledJob : BaseEntity
{
    public int JobId { get; set; }
    public DateTime ScheduledStartTime { get; set; }
    public DateTime ScheduledEndTime { get; set; }
    public string? Location { get; set; }
    public string? ScheduleNotes { get; set; }
    public bool IsConfirmed { get; set; } = false;
    
    // Navigation property
    public Job Job { get; set; } = null!;
}
