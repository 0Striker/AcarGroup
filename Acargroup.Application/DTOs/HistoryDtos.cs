namespace Acargroup.Application.DTOs;

public class HistoryDto
{
    public int Id { get; set; }
    public string Years { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Icon { get; set; } = null!;
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class HistoryCreateUpdateDto
{
    public string Years { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Icon { get; set; } = null!;
    public string? ImageUrl { get; set; }
}
