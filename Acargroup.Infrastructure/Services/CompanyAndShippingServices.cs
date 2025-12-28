using Acargroup.Application.DTOs;
using Acargroup.Domain.Entities;
using Acargroup.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Acargroup.Infrastructure.Services;

public interface IShippingCompanyService
{
    Task<IEnumerable<ShippingCompanyDto>> GetAllAsync();
    Task<ShippingCompanyDto?> GetByIdAsync(int id);
    Task<ShippingCompanyDto> CreateAsync(ShippingCompanyCreateDto dto);
    Task UpdateAsync(int id, ShippingCompanyUpdateDto dto);
    Task DeleteAsync(int id);
}

public class ShippingCompanyService : IShippingCompanyService
{
    private readonly AcargroupDbContext _context;

    public ShippingCompanyService(AcargroupDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ShippingCompanyDto>> GetAllAsync()
    {
        return await _context.ShippingCompanies
            .Select(x => new ShippingCompanyDto
            {
                Id = x.Id,
                Name = x.Name,
                Address = x.Address,
                Phone = x.Phone
            })
            .ToListAsync();
    }

    public async Task<ShippingCompanyDto?> GetByIdAsync(int id)
    {
        var entity = await _context.ShippingCompanies.FindAsync(id);
        if (entity == null) return null;

        return new ShippingCompanyDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Address = entity.Address,
            Phone = entity.Phone
        };
    }

    public async Task<ShippingCompanyDto> CreateAsync(ShippingCompanyCreateDto dto)
    {
        var entity = new ShippingCompany
        {
            Name = dto.Name,
            Address = dto.Address,
            Phone = dto.Phone
        };
        
        _context.ShippingCompanies.Add(entity);
        await _context.SaveChangesAsync();
        
        return new ShippingCompanyDto
        {
             Id = entity.Id,
             Name = entity.Name,
             Address = entity.Address,
             Phone = entity.Phone
        };
    }

    public async Task UpdateAsync(int id, ShippingCompanyUpdateDto dto)
    {
        var entity = await _context.ShippingCompanies.FindAsync(id);
        if (entity == null) throw new KeyNotFoundException("Shipping company not found");

        entity.Name = dto.Name;
        entity.Address = dto.Address;
        entity.Phone = dto.Phone;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _context.ShippingCompanies.FindAsync(id);
        if (entity == null) return; // Or throw

        _context.ShippingCompanies.Remove(entity);
        await _context.SaveChangesAsync();
    }
}

public interface ICompanyService
{
    Task<IEnumerable<CompanyDto>> GetAllAsync();
    Task<CompanyDto?> GetByIdAsync(int id);
    Task<CompanyDto> CreateAsync(CompanyCreateDto dto);
    Task UpdateAsync(int id, CompanyUpdateDto dto);
    Task DeleteAsync(int id);
}

public class CompanyService : ICompanyService
{
    private readonly AcargroupDbContext _context;

    public CompanyService(AcargroupDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CompanyDto>> GetAllAsync()
    {
        return await _context.Companies
            .Select(x => new CompanyDto
            {
                Id = x.Id,
                Name = x.Name,
                AuthorizedPerson = x.AuthorizedPerson,
                Phone = x.Phone,
                Address = x.Address,
                Email = x.Email,
                Sector = x.Sector,
                Notes = x.Notes,
                StampNumber = x.StampNumber,
                LoginName = x.LoginName,
                LoginCode = x.LoginCode,
                LoginPassword = x.LoginPassword,
                ShippingCompanyName = x.ShippingCompanyName
            })
            .ToListAsync();
    }

    public async Task<CompanyDto?> GetByIdAsync(int id)
    {
        var entity = await _context.Companies
            .FirstOrDefaultAsync(c => c.Id == id);
            
        if (entity == null) return null;

        return new CompanyDto
        {
            Id = entity.Id,
            Name = entity.Name,
            AuthorizedPerson = entity.AuthorizedPerson,
            Phone = entity.Phone,
            Address = entity.Address,
            Email = entity.Email,
            Sector = entity.Sector,
            Notes = entity.Notes,
            StampNumber = entity.StampNumber,
            LoginName = entity.LoginName,
            LoginCode = entity.LoginCode,
            LoginPassword = entity.LoginPassword,
            ShippingCompanyName = entity.ShippingCompanyName
        };
    }

    public async Task<CompanyDto> CreateAsync(CompanyCreateDto dto)
    {
        var entity = new Company
        {
            Name = dto.Name,
            AuthorizedPerson = dto.AuthorizedPerson,
            Phone = dto.Phone,
            Address = dto.Address,
            Email = dto.Email,
            Sector = dto.Sector,
            Notes = dto.Notes,
            StampNumber = dto.StampNumber,
            LoginName = dto.LoginName,
            LoginCode = dto.LoginCode,
            LoginPassword = dto.LoginPassword,
            ShippingCompanyName = dto.ShippingCompanyName
        };
        
        _context.Companies.Add(entity);
        await _context.SaveChangesAsync();
        
        return await GetByIdAsync(entity.Id) ?? throw new InvalidOperationException("Failed to retrieve created company");
    }

    public async Task UpdateAsync(int id, CompanyUpdateDto dto)
    {
        var entity = await _context.Companies.FindAsync(id);
        if (entity == null) throw new KeyNotFoundException("Company not found");

        entity.Name = dto.Name;
        entity.AuthorizedPerson = dto.AuthorizedPerson;
        entity.Phone = dto.Phone;
        entity.Address = dto.Address;
        entity.Email = dto.Email;
        entity.Sector = dto.Sector;
        entity.Notes = dto.Notes;
        entity.StampNumber = dto.StampNumber;
        entity.LoginName = dto.LoginName;
        entity.LoginCode = dto.LoginCode;
        entity.LoginPassword = dto.LoginPassword;
        entity.ShippingCompanyName = dto.ShippingCompanyName;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _context.Companies.FindAsync(id);
        if (entity == null) return;

        _context.Companies.Remove(entity);
        await _context.SaveChangesAsync();
    }
}
