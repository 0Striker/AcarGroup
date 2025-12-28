using Acargroup.Domain.Common;

namespace Acargroup.Domain.Entities;

public class JobTemplate : BaseEntity
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal EstimatedCost { get; set; }
    public int? EstimatedHours { get; set; }
    public int Priority { get; set; } = 2;
    
    // JSON arrays stored as strings
    public string? RequiredMaterials { get; set; } // JSON array
    public string? ChecklistItems { get; set; } // JSON array
    
    public bool IsActive { get; set; } = true;
}
