namespace Acargroup.Application.DTOs;

public class JobCreateDto
{
    public int CustomerId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal EstimatedCost { get; set; }
    public string? Notes { get; set; }
    
    public int Priority { get; set; } = 2;
    public DateTime? ScheduledDate { get; set; }
    public DateTime? PreferredDateStart { get; set; }
    public DateTime? PreferredDateEnd { get; set; }
    public int? EstimatedHours { get; set; }
    public string? Address { get; set; }
    public string? ContactPerson { get; set; }
    public string? ContactPhone { get; set; }
    public List<string>? RequiredMaterials { get; set; }
}
