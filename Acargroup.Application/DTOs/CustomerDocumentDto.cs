using Acargroup.Domain.Enums;

namespace Acargroup.Application.DTOs;

public class CustomerDocumentDto
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public DocumentType Type { get; set; }
    public string FileName { get; set; } = null!;
    public string CloudinaryUrl { get; set; } = null!;
    public DateTime UploadedAt { get; set; }
    public string UploadedBy { get; set; } = null!;
}
