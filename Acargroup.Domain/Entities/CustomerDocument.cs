using Acargroup.Domain.Enums;

namespace Acargroup.Domain.Entities;

public class CustomerDocument
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public DocumentType Type { get; set; }
    public string FileName { get; set; } = null!;
    public string CloudinaryUrl { get; set; } = null!;
    public string CloudinaryPublicId { get; set; } = null!;
    public DateTime UploadedAt { get; set; }
    public string UploadedBy { get; set; } = null!; // Admin who uploaded
}
