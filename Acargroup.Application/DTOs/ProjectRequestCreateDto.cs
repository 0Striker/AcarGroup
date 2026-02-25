namespace Acargroup.Application.DTOs;

public class ProjectRequestCreateDto
{
    public string ServiceType { get; set; } = null!;
    public string City { get; set; } = null!;
    public string District { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string Address { get; set; } = null!;
}
