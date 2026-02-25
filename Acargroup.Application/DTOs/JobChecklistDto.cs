namespace Acargroup.Application.DTOs;

public class JobChecklistDto
{
    public int Id { get; set; }
    public int JobId { get; set; }
    public string Title { get; set; } = null!;
    public bool IsCompleted { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int? CompletedByPersonnelId { get; set; }
    public string? CompletedByPersonnelName { get; set; }
}

public class JobChecklistCreateDto
{
    public int JobId { get; set; }
    public string Title { get; set; } = null!;
    public int DisplayOrder { get; set; } = 0;
}

public class JobChecklistUpdateDto
{
    public bool IsCompleted { get; set; }
    public int? CompletedByPersonnelId { get; set; }
}
