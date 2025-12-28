using Acargroup.Domain.Common;

namespace Acargroup.Domain.Entities;

public class Customer : BaseEntity
{
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string? TC { get; set; } // Turkish ID Number (for individuals)
    public string? VKN { get; set; } // Tax ID Number (for companies)
    public byte[] PasswordHash { get; set; } = null!;
    public byte[] PasswordSalt { get; set; } = null!;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public bool IsAdmin { get; set; } = false;

    // Navigation property
    public ICollection<CustomerAddress> Addresses { get; set; } = new List<CustomerAddress>();
}
