namespace Acargroup.Application.DTOs;

public class CustomerDeviceDto
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public int? CustomerPurchasedProductId { get; set; }
    public string? ProductName { get; set; } // For display
    
    public string DeviceType { get; set; } = "Recording";
    
    public string? DeviceUsername { get; set; }
    public string? DevicePassword { get; set; }
    public string? LocalIpAddress { get; set; }
    public string? MacAddress { get; set; }
    public string? ModemInfo { get; set; }
    public string? ModemPassword { get; set; }
    public bool HasInternetMonitoring { get; set; }
    public string? SerialNumber { get; set; }
    public string? ModemSerialNumber { get; set; }
    public string? DeviceImporter { get; set; }
    public string? DeviceModel { get; set; }
    public string? MaterialNotes { get; set; }
    public string? QrCodeUrl { get; set; }
    
    public string? DeviceAddress { get; set; }
    public string? CameraNotes { get; set; }
    
    public string? HddSerialNumber { get; set; }
    public string? HddBrand { get; set; }
    public string? HddImporter { get; set; }
    public string? HddCapacity { get; set; }
    
    public DateTime CreatedAt { get; set; }
}

public class CreateCustomerDeviceDto
{
    public int? CustomerPurchasedProductId { get; set; }
    
    public string DeviceType { get; set; } = "Recording";
    
    public string? DeviceUsername { get; set; }
    public string? DevicePassword { get; set; }
    public string? LocalIpAddress { get; set; }
    public string? MacAddress { get; set; }
    public string? ModemInfo { get; set; }
    public string? ModemPassword { get; set; }
    public bool HasInternetMonitoring { get; set; }
    public string? SerialNumber { get; set; }
    public string? ModemSerialNumber { get; set; }
    public string? DeviceImporter { get; set; }
    public string? DeviceModel { get; set; }
    public string? MaterialNotes { get; set; }
    public string? QrCodeUrl { get; set; }
    
    public string? DeviceAddress { get; set; }
    public string? CameraNotes { get; set; }
    
    public string? HddSerialNumber { get; set; }
    public string? HddBrand { get; set; }
    public string? HddImporter { get; set; }
    public string? HddCapacity { get; set; }
}

public class UpdateCustomerDeviceDto : CreateCustomerDeviceDto
{
}
