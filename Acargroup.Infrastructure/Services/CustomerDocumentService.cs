using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Domain.Entities;
using Acargroup.Domain.Enums;
using Acargroup.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Acargroup.Infrastructure.Services;

public class CustomerDocumentService : ICustomerDocumentService
{
    private readonly AcargroupDbContext _context;
    private readonly IFileUploadService _fileUploadService;

    public CustomerDocumentService(AcargroupDbContext context, IFileUploadService fileUploadService)
    {
        _context = context;
        _fileUploadService = fileUploadService;
    }

    public async Task<List<CustomerDocumentDto>> GetByCustomerIdAsync(int customerId)
    {
        var documents = await _context.CustomerDocuments
            .Where(d => d.CustomerId == customerId)
            .OrderByDescending(d => d.UploadedAt)
            .ToListAsync();

        return documents.Select(MapToDto).ToList();
    }

    public async Task<List<CustomerDocumentDto>> GetByCustomerAndTypeAsync(int customerId, DocumentType type)
    {
        var documents = await _context.CustomerDocuments
            .Where(d => d.CustomerId == customerId && d.Type == type)
            .OrderByDescending(d => d.UploadedAt)
            .ToListAsync();

        return documents.Select(MapToDto).ToList();
    }

    public async Task<CustomerDocumentDto> UploadAsync(Stream fileStream, string fileName, string contentType, int customerId, DocumentType type, string uploaderName)
    {
        // Validate file
        if (fileStream == null || fileStream.Length == 0)
            throw new ArgumentException("Dosya geçersiz.");

        // Only allow images
        var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };
        if (!allowedTypes.Contains(contentType.ToLower()))
            throw new ArgumentException("Sadece resim dosyaları yüklenebilir.");

        // Max 5MB
        if (fileStream.Length > 5 * 1024 * 1024)
            throw new ArgumentException("Dosya boyutu 5MB'dan küçük olmalıdır.");

        // Upload to local storage using stream directly
        var fileUrl = await _fileUploadService.UploadImageAsync(fileStream, fileName, "documents");
        
        // Create document record
        var document = new CustomerDocument
        {
            CustomerId = customerId,
            Type = type,
            FileName = fileName,
            CloudinaryUrl = fileUrl, // Reusing field for local path
            CloudinaryPublicId = "", // Not used for local storage
            UploadedAt = DateTime.UtcNow,
            UploadedBy = uploaderName
        };

        _context.CustomerDocuments.Add(document);
        await _context.SaveChangesAsync();

        return MapToDto(document);
    }

    public async Task DeleteAsync(int id)
    {
        var document = await _context.CustomerDocuments.FindAsync(id);
        if (document == null)
            throw new KeyNotFoundException("Belge bulunamadı.");

        // Delete from local storage
        await _fileUploadService.DeleteImageAsync(document.CloudinaryUrl);

        // Delete from database
        _context.CustomerDocuments.Remove(document);
        await _context.SaveChangesAsync();
    }

    private static CustomerDocumentDto MapToDto(CustomerDocument document)
    {
        return new CustomerDocumentDto
        {
            Id = document.Id,
            CustomerId = document.CustomerId,
            Type = document.Type,
            FileName = document.FileName,
            CloudinaryUrl = document.CloudinaryUrl,
            UploadedAt = document.UploadedAt,
            UploadedBy = document.UploadedBy
        };
    }
}
