using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Domain.Entities;
using Acargroup.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Acargroup.Infrastructure.Services;

public class CustomerDeviceService : ICustomerDeviceService
{
    private readonly AcargroupDbContext _context;

    public CustomerDeviceService(AcargroupDbContext context)
    {
        _context = context;
    }

    public async Task<List<CustomerDeviceDto>> GetByCustomerAsync(int customerId)
    {
        var devices = await _context.CustomerDevices
            .Include(d => d.PurchasedProduct)
            .Where(d => d.CustomerId == customerId)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();

        return devices.Select(MapToDto).ToList();
    }

    public async Task<CustomerDeviceDto?> GetByIdAsync(int id)
    {
        var device = await _context.CustomerDevices
            .Include(d => d.PurchasedProduct)
            .FirstOrDefaultAsync(d => d.Id == id);

        return device == null ? null : MapToDto(device);
    }

    public async Task<CustomerDeviceDto> CreateAsync(int customerId, CreateCustomerDeviceDto dto)
    {
        var device = new CustomerDevice
        {
            CustomerId = customerId,
            CustomerPurchasedProductId = dto.CustomerPurchasedProductId,
            DeviceType = dto.DeviceType,
            DeviceUsername = dto.DeviceUsername,
            DevicePassword = dto.DevicePassword,
            LocalIpAddress = dto.LocalIpAddress,
            MacAddress = dto.MacAddress,
            ModemInfo = dto.ModemInfo,
            ModemPassword = dto.ModemPassword,
            HasInternetMonitoring = dto.HasInternetMonitoring,
            SerialNumber = dto.SerialNumber,
            QrCodeUrl = dto.QrCodeUrl,
            
            // New Fields
            ModemSerialNumber = dto.ModemSerialNumber,
            DeviceImporter = dto.DeviceImporter,
            DeviceModel = dto.DeviceModel,
            MaterialNotes = dto.MaterialNotes,
            
            // Additional info
            DeviceAddress = dto.DeviceAddress,
            CameraNotes = dto.CameraNotes,
            HddSerialNumber = dto.HddSerialNumber,
            HddBrand = dto.HddBrand,
            HddImporter = dto.HddImporter,
            HddCapacity = dto.HddCapacity,
            
            CreatedAt = DateTime.UtcNow
        };

        _context.CustomerDevices.Add(device);
        await _context.SaveChangesAsync();

        // Reload to get navigation properties if needed, or just map manually
        if (device.CustomerPurchasedProductId.HasValue)
        {
            await _context.Entry(device).Reference(d => d.PurchasedProduct).LoadAsync();
        }

        return MapToDto(device);
    }

    public async Task<CustomerDeviceDto?> UpdateAsync(int id, UpdateCustomerDeviceDto dto)
    {
        var device = await _context.CustomerDevices.FindAsync(id);
        if (device == null) return null;

        device.CustomerPurchasedProductId = dto.CustomerPurchasedProductId;
        device.DeviceType = dto.DeviceType;
        device.DeviceUsername = dto.DeviceUsername;
        device.DevicePassword = dto.DevicePassword;
        device.LocalIpAddress = dto.LocalIpAddress;
        device.MacAddress = dto.MacAddress;
        device.ModemInfo = dto.ModemInfo;
        device.ModemPassword = dto.ModemPassword;
        device.HasInternetMonitoring = dto.HasInternetMonitoring;
        device.SerialNumber = dto.SerialNumber;
        device.QrCodeUrl = dto.QrCodeUrl;
        
        // New Fields
        device.ModemSerialNumber = dto.ModemSerialNumber;
        device.DeviceImporter = dto.DeviceImporter;
        device.DeviceModel = dto.DeviceModel;
        device.MaterialNotes = dto.MaterialNotes;
        
        // Additional info
        device.DeviceAddress = dto.DeviceAddress;
        device.CameraNotes = dto.CameraNotes;
        device.HddSerialNumber = dto.HddSerialNumber;
        device.HddBrand = dto.HddBrand;
        device.HddImporter = dto.HddImporter;
        device.HddCapacity = dto.HddCapacity;
        
        device.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        
        if (device.CustomerPurchasedProductId.HasValue)
        {
            await _context.Entry(device).Reference(d => d.PurchasedProduct).LoadAsync();
        }

        return MapToDto(device);
    }

    public async Task<bool> UpdateQrCodeAsync(int id, string qrCodeUrl)
    {
        var device = await _context.CustomerDevices.FindAsync(id);
        if (device == null) return false;

        device.QrCodeUrl = qrCodeUrl;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var device = await _context.CustomerDevices.FindAsync(id);
        if (device == null) return false;

        _context.CustomerDevices.Remove(device);
        await _context.SaveChangesAsync();
        return true;
    }

    private static CustomerDeviceDto MapToDto(CustomerDevice device)
    {
        return new CustomerDeviceDto
        {
            Id = device.Id,
            CustomerId = device.CustomerId,
            CustomerPurchasedProductId = device.CustomerPurchasedProductId,
            ProductName = device.PurchasedProduct?.ProductName,
            DeviceType = device.DeviceType,
            DeviceUsername = device.DeviceUsername,
            DevicePassword = device.DevicePassword,
            LocalIpAddress = device.LocalIpAddress,
            MacAddress = device.MacAddress,
            ModemInfo = device.ModemInfo,
            ModemPassword = device.ModemPassword,
            HasInternetMonitoring = device.HasInternetMonitoring,
            SerialNumber = device.SerialNumber,
            QrCodeUrl = device.QrCodeUrl,
            
            // New Fields
            ModemSerialNumber = device.ModemSerialNumber,
            DeviceImporter = device.DeviceImporter,
            DeviceModel = device.DeviceModel,
            MaterialNotes = device.MaterialNotes,
            
            // Additional info
            DeviceAddress = device.DeviceAddress,
            CameraNotes = device.CameraNotes,
            HddSerialNumber = device.HddSerialNumber,
            HddBrand = device.HddBrand,
            HddImporter = device.HddImporter,
            HddCapacity = device.HddCapacity,
            
            CreatedAt = device.CreatedAt
        };
    }
}
