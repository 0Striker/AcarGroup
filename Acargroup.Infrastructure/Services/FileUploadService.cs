using Acargroup.Application.Interfaces;

namespace Acargroup.Infrastructure.Services;

public class FileUploadService : IFileUploadService
{
    private readonly string _wwwrootPath;
    private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
    private const long MaxFileSize = 5 * 1024 * 1024; // 5MB

    public FileUploadService()
    {
        // Get wwwroot path - assuming standard ASP.NET structure
        // This will point to Acargroup.Api/wwwroot
        var baseDirectory = AppDomain.CurrentDomain.BaseDirectory;
        _wwwrootPath = Path.Combine(baseDirectory, "wwwroot");
        
        // Ensure wwwroot exists
        if (!Directory.Exists(_wwwrootPath))
        {
            Directory.CreateDirectory(_wwwrootPath);
        }
    }

    public async Task<string> UploadImageAsync(Stream imageStream, string fileName, string folder)
    {
        // Validate file extension
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        if (!_allowedExtensions.Contains(extension))
        {
            throw new InvalidOperationException($"Geçersiz dosya tipi. İzin verilen: {string.Join(", ", _allowedExtensions)}");
        }

        // Validate file size
        if (imageStream.Length > MaxFileSize)
        {
            throw new InvalidOperationException($"Dosya boyutu çok büyük. Maksimum: {MaxFileSize / 1024 / 1024}MB");
        }

        // Create upload directory if it doesn't exist
        var uploadFolder = Path.Combine(_wwwrootPath, "uploads", folder);
        if (!Directory.Exists(uploadFolder))
        {
            Directory.CreateDirectory(uploadFolder);
        }

        // Generate unique filename
        var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(fileName)}";
        var filePath = Path.Combine(uploadFolder, uniqueFileName);

        // Save file
        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await imageStream.CopyToAsync(fileStream);
        }

        // Return relative URL path
        return $"/uploads/{folder}/{uniqueFileName}";
    }

    public async Task<bool> DeleteImageAsync(string filePath)
    {
        try
        {
            // Remove leading slash if present
            var relativePath = filePath.TrimStart('/');
            var fullPath = Path.Combine(_wwwrootPath, relativePath);

            if (File.Exists(fullPath))
            {
                await Task.Run(() => File.Delete(fullPath));
                return true;
            }

            return false;
        }
        catch
        {
            return false;
        }
    }

    public string GetImageUrl(string filePath)
    {
        // Already returns relative URL, can be extended to return full URL if needed
        return filePath;
    }
}
