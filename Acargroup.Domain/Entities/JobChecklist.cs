using Acargroup.Domain.Common;

namespace Acargroup.Domain.Entities;

public class JobChecklist : BaseEntity
{
    public int JobId { get; set; }
    public string Title { get; set; } = null!;
    public bool IsCompleted { get; set; } = false;
    public int DisplayOrder { get; set; } = 0;
    public DateTime? CompletedAt { get; set; }
    public int? CompletedByPersonnelId { get; set; }
    
    // Navigation properties
    public Job Job { get; set; } = null!;
    public Personnel? CompletedByPersonnel { get; set; }
}
