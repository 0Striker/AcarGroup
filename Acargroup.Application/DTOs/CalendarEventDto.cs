namespace Acargroup.Application.DTOs;

public class CalendarEventDto
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public DateTime Start { get; set; }
    public DateTime End { get; set; }
    public string CustomerName { get; set; } = null!;
    public string? PersonnelName { get; set; }
    public string Status { get; set; } = null!;
    public string? Location { get; set; }
    public bool IsConfirmed { get; set; }
}
