namespace Acargroup.Application.DTOs;

public class CustomerAddressCreateUpdateDto
{
    public string Label { get; set; } = null!;
    public string City { get; set; } = null!;
    public string District { get; set; } = null!;
    public string FullAddress { get; set; } = null!;
    public string? PostalCode { get; set; }
    public string? Notes { get; set; }
    public bool IsDefault { get; set; } = false;
}
