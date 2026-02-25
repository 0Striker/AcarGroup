namespace Acargroup.Application.DTOs;

public class JobUpdateDto
{
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal EstimatedCost { get; set; }
    public decimal? ActualCost { get; set; }
    public string? Notes { get; set; }
    
    // Enhanced fields
    public int Priority { get; set; }
    public DateTime? ScheduledDate { get; set; }
    public int? EstimatedHours { get; set; }
    public string? Address { get; set; }
    public string? ContactPerson { get; set; }
    public string? ContactPhone { get; set; }
    public List<string>? RequiredMaterials { get; set; }
}
