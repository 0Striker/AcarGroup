using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Domain.Entities;
using Acargroup.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Acargroup.Infrastructure.Services;

public class PersonnelService : IPersonnelService
{
    private readonly AcargroupDbContext _context;

    public PersonnelService(AcargroupDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PersonnelDto>> GetAllAsync()
    {
        var personnel = await _context.Personnel
            .OrderBy(p => p.FullName)
            .ToListAsync();

        return personnel.Select(MapToDto);
    }

    public async Task<IEnumerable<PersonnelDto>> GetActivePersonnelAsync()
    {
        var personnel = await _context.Personnel
            .Where(p => p.IsActive)
            .OrderBy(p => p.FullName)
            .ToListAsync();

        return personnel.Select(MapToDto);
    }

    public async Task<PersonnelDto?> GetByIdAsync(int id)
    {
        var person = await _context.Personnel.FindAsync(id);
        return person == null ? null : MapToDto(person);
    }

    public async Task<PersonnelDto> CreateAsync(PersonnelCreateDto dto)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            using var hmac = new System.Security.Cryptography.HMACSHA512();

            var person = new Personnel
            {
                FullName = dto.FullName,
                Email = dto.Email,
                Phone = dto.Phone,
                Specialization = dto.Specialization,
                BloodType = dto.BloodType,
                HasDriverLicense = dto.HasDriverLicense,
                PasswordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(dto.Password)),
                PasswordSalt = hmac.Key,
                IsActive = true, // Default active
                CreatedAt = DateTime.UtcNow
            };

            _context.Personnel.Add(person);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return MapToDto(person);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<PersonnelDto> UpdateAsync(int id, PersonnelUpdateDto dto)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var person = await _context.Personnel.FindAsync(id);
            if (person == null)
                throw new KeyNotFoundException($"Personnel with ID {id} not found.");

            person.FullName = dto.FullName;
            person.Email = dto.Email;
            person.Phone = dto.Phone;
            person.Specialization = dto.Specialization;
            person.BloodType = dto.BloodType;
            person.HasDriverLicense = dto.HasDriverLicense;
            person.IsActive = dto.IsActive;
            person.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return MapToDto(person);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> DeleteAsync(int id)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var person = await _context.Personnel.FindAsync(id);
            if (person == null) return false;

            _context.Personnel.Remove(person);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return true;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<IEnumerable<dynamic>> GetJobsForPersonnelAsync(int personnelId)
    {
        var jobs = await _context.Jobs
            .Where(j => j.AssignedPersonnelId == personnelId)
            .Select(j => new
            {
                j.Id,
                j.Status,
                ScheduledEndTime = j.ScheduledJob != null 
                    ? j.ScheduledJob.ScheduledEndTime 
                    : (DateTime?)null
            })
            .ToListAsync();

        return jobs;
    }

    private static PersonnelDto MapToDto(Personnel person)
    {
        return new PersonnelDto
        {
            Id = person.Id,
            FullName = person.FullName,
            Email = person.Email,
            Phone = person.Phone,
            Specialization = person.Specialization,
            BloodType = person.BloodType,
            HasDriverLicense = person.HasDriverLicense,
            IsActive = person.IsActive,
            CreatedAt = person.CreatedAt
        };
    }
}
