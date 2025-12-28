using Acargroup.Domain.Enums;

namespace Acargroup.Application.DTOs;

public class JobStatusChangeDto
{
    public JobStatus NewStatus { get; set; }
    public string? Notes { get; set; }
}
