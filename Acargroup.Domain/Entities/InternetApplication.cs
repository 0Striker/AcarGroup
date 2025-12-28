using System.ComponentModel.DataAnnotations;
using Acargroup.Domain.Common;

namespace Acargroup.Domain.Entities;

public class InternetApplication : BaseEntity
{
    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Address { get; set; } = string.Empty;

    // 0: Yeni, 1: İncelendi, 2: Tamamlandı, 3: İptal
    public int Status { get; set; } = 0;
}
