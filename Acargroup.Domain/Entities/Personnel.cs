using Acargroup.Domain.Common;

namespace Acargroup.Domain.Entities;

public class Personnel : BaseEntity
{
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string? Address { get; set; }
    public string? TC { get; set; } // Turkish ID Number
    public byte[] PasswordHash { get; set; } = null!;
    public byte[] PasswordSalt { get; set; } = null!;
    public string? Specialization { get; set; } // e.g., "Electrician", "Technician"
    public string? BloodType { get; set; } // e.g., "A+", "O-", etc.
    public bool HasDriverLicense { get; set; } = false;
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public ICollection<Job> AssignedJobs { get; set; } = new List<Job>();
}
