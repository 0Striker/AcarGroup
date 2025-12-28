namespace Acargroup.Application.DTOs;

public class ProjectRequestListDto
{
    public int Id { get; set; }
    public string ProjectType { get; set; } = null!;
    public string City { get; set; } = null!;
    public string District { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public string Status { get; set; } = null!;
}
