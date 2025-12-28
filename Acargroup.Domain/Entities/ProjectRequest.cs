using Acargroup.Domain.Common;

namespace Acargroup.Domain.Entities;

public class ProjectRequest : BaseEntity
{
    public string ProjectType { get; set; } = null!; // Renamed from ServiceType
    public string City { get; set; } = null!;
    public string District { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string Address { get; set; } = null!;
    public string? Description { get; set; }
    public string Status { get; set; } = "New"; // "New", "InReview", "Completed"
    public bool IsArchived { get; set; } = false;
}
