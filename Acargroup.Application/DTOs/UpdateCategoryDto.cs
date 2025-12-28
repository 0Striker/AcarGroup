using System.ComponentModel.DataAnnotations;

namespace Acargroup.Application.DTOs;

public class UpdateCategoryDto
{
    [Required]
    public string Name { get; set; } = null!;
    
    public string? Description { get; set; }
}
