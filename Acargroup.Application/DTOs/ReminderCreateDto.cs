namespace Acargroup.Application.DTOs;

public class ReminderCreateDto
{
    public string Title { get; set; } = string.Empty;
    public DateTime ReminderDate { get; set; }
}
