namespace Acargroup.Application.DTOs;

public class JobTemplateDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal EstimatedCost { get; set; }
    public int? EstimatedHours { get; set; }
    public int Priority { get; set; }
    public List<string>? RequiredMaterials { get; set; }
    public List<string>? ChecklistItems { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class JobTemplateCreateDto
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal EstimatedCost { get; set; }
    public int? EstimatedHours { get; set; }
    public int Priority { get; set; } = 2;
    public List<string>? RequiredMaterials { get; set; }
    public List<string>? ChecklistItems { get; set; }
}
