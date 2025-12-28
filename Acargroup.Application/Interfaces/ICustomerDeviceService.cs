using Acargroup.Application.DTOs;

namespace Acargroup.Application.Interfaces;

public interface ICustomerDeviceService
{
    Task<List<CustomerDeviceDto>> GetByCustomerAsync(int customerId);
    Task<CustomerDeviceDto?> GetByIdAsync(int id);
    Task<CustomerDeviceDto> CreateAsync(int customerId, CreateCustomerDeviceDto dto);
    Task<CustomerDeviceDto?> UpdateAsync(int id, UpdateCustomerDeviceDto dto);
    Task<bool> UpdateQrCodeAsync(int id, string qrCodeUrl);
    Task<bool> DeleteAsync(int id);
}
