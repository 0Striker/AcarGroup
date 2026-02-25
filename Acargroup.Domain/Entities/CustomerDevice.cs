using Acargroup.Domain.Common;

namespace Acargroup.Domain.Entities;

public class CustomerDevice : BaseEntity
{
    public int CustomerId { get; set; }
    public int? CustomerPurchasedProductId { get; set; }
    
    // Device Type: "Recording" or "Alarm"
    public string DeviceType { get; set; } = "Recording";
    
    public string? DeviceUsername { get; set; }
    public string? DevicePassword { get; set; }
    public string? LocalIpAddress { get; set; }
    public string? MacAddress { get; set; }
    public string? ModemInfo { get; set; }
    public string? ModemPassword { get; set; }
    public bool HasInternetMonitoring { get; set; }
    public string? SerialNumber { get; set; }
    public string? ModemSerialNumber { get; set; } // New Field
    public string? DeviceImporter { get; set; } // New Field
    public string? DeviceModel { get; set; } // New Field
    public string? MaterialNotes { get; set; } // New Field
    public string? QrCodeUrl { get; set; }
    
    // Additional device information
    public string? DeviceAddress { get; set; }
    public string? CameraNotes { get; set; }
    
    // HDD Information
    public string? HddSerialNumber { get; set; }
    public string? HddBrand { get; set; } // New Field
    public string? HddImporter { get; set; }
    public string? HddCapacity { get; set; }

    // Navigation properties
    public Customer Customer { get; set; } = null!;
    public CustomerPurchasedProduct? PurchasedProduct { get; set; }
}
