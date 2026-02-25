using Acargroup.Application.DTOs;
using Acargroup.Application.Interfaces;
using Acargroup.Domain.Entities;
using Acargroup.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Acargroup.Infrastructure.Services;

public class ProjectRequestAdminService : IProjectRequestAdminService
{
    private readonly AcargroupDbContext _context;

    public ProjectRequestAdminService(AcargroupDbContext context)
    {
        _context = context;
        // License configuration for QuestPDF (Community License)
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public async Task<List<ProjectRequestListDto>> GetAllAsync(string? status = null, bool includeArchived = false)
    {
        var query = _context.ProjectRequests.AsQueryable();

        if (!includeArchived)
        {
            query = query.Where(r => !r.IsArchived);
        }

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(r => r.Status == status);
        }

        var requests = await query
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return requests.Select(r => new ProjectRequestListDto
        {
            Id = r.Id,
            ProjectType = r.ProjectType,
            City = r.City,
            District = r.District,
            FullName = r.FullName,
            Phone = r.Phone,
            CreatedAt = r.CreatedAt,
            Status = r.Status
        }).ToList();
    }

    public async Task<ProjectRequestDetailDto?> GetByIdAsync(int id)
    {
        var request = await _context.ProjectRequests.FindAsync(id);

        if (request == null) return null;

        return new ProjectRequestDetailDto
        {
            Id = request.Id,
            ProjectType = request.ProjectType,
            City = request.City,
            District = request.District,
            FullName = request.FullName,
            Phone = request.Phone,
            Address = request.Address,
            Description = request.Description,
            CreatedAt = request.CreatedAt,
            Status = request.Status,
            IsArchived = request.IsArchived
        };
    }

    public async Task UpdateStatusAsync(int id, string status)
    {
        var request = await _context.ProjectRequests.FindAsync(id);
        if (request == null)
        {
            throw new KeyNotFoundException($"Proje talebi bulunamadı: {id}");
        }

        request.Status = status;
        request.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    public async Task ArchiveAsync(int id)
    {
        var request = await _context.ProjectRequests.FindAsync(id);
        if (request == null)
        {
            throw new KeyNotFoundException($"Proje talebi bulunamadı: {id}");
        }

        request.IsArchived = true;
        request.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    public async Task<byte[]> GeneratePdfAsync(int id)
    {
        var request = await GetByIdAsync(id);
        if (request == null)
        {
            throw new KeyNotFoundException($"Proje talebi bulunamadı: {id}");
        }

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(12));

                page.Header()
                    .Text($"Proje Talebi #{request.Id}")
                    .SemiBold().FontSize(24).FontColor(Colors.Blue.Medium);

                page.Content()
                    .PaddingVertical(1, Unit.Centimetre)
                    .Column(x =>
                    {
                        x.Spacing(20);

                        x.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(150);
                                columns.RelativeColumn();
                            });

                            // Helper method to add rows
                            void AddRow(string label, string value)
                            {
                                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(label).SemiBold();
                                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(value);
                            }

                            AddRow("Talep Tarihi", request.CreatedAt.ToString("dd.MM.yyyy HH:mm"));
                            AddRow("Durum", request.Status);
                            AddRow("Proje Türü", request.ProjectType);
                            AddRow("Ad Soyad", request.FullName);
                            AddRow("Telefon", request.Phone);
                            AddRow("Şehir / İlçe", $"{request.City} / {request.District}");
                            AddRow("Adres", request.Address);
                        });

                        if (!string.IsNullOrEmpty(request.Description))
                        {
                            x.Item().Column(col =>
                            {
                                col.Spacing(5);
                                col.Item().Text("Açıklama").SemiBold().FontSize(14);
                                col.Item().Text(request.Description);
                            });
                        }
                    });

                page.Footer()
                    .AlignCenter()
                    .Text(x =>
                    {
                        x.Span("Sayfa ");
                        x.CurrentPageNumber();
                    });
            });
        });

        return document.GeneratePdf();
    }
}
