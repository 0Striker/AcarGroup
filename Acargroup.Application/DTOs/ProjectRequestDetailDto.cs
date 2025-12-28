namespace Acargroup.Application.DTOs;

public class ProjectRequestDetailDto
{
    public int Id { get; set; }
    public string ProjectType { get; set; } = null!;
    public string City { get; set; } = null!;
    public string District { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string Address { get; set; } = null!;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Status { get; set; } = null!;
    public bool IsArchived { get; set; }
}
