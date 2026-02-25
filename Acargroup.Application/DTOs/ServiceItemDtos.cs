namespace Acargroup.Application.DTOs;

public class ServiceItemCreateDto
{
    public int CustomerId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
}

public class ServiceItemResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? AdminNote { get; set; }
    public string? PhotoPath { get; set; }
}

public class ServiceItemStatusHistoryDto
{
    public string Status { get; set; } = null!;
    public string? Note { get; set; }
    public string ChangedBy { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}

public class ServiceItemDetailDto : ServiceItemResponseDto
{
    public string CustomerName { get; set; } = null!;
    public string CustomerEmail { get; set; } = null!;
    public string CustomerPhone { get; set; } = null!;
    public List<ServiceItemStatusHistoryDto> History { get; set; } = new();
}

public class ServiceItemStatusUpdateDto
{
    public string Status { get; set; } = null!;
    public string? Note { get; set; }
}

public class ServiceItemAdminNoteDto
{
    public string Note { get; set; } = null!;
}
