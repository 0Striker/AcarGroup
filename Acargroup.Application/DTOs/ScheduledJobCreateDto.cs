namespace Acargroup.Application.DTOs;

public class ScheduledJobCreateDto
{
    public int JobId { get; set; }
    public DateTime ScheduledStartTime { get; set; }
    public DateTime ScheduledEndTime { get; set; }
    public string? Location { get; set; }
    public string? ScheduleNotes { get; set; }
}
