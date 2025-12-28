using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;

namespace Acargroup.Infrastructure.Services;

public interface ICloudinaryService
{
    Task<string> UploadImageAsync(Stream imageStream, string fileName);
    Task<bool> DeleteImageAsync(string publicId);
}

public class CloudinaryService : ICloudinaryService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryService(IConfiguration configuration)
    {
        var cloudName = configuration["Cloudinary:CloudName"];
        var apiKey = configuration["Cloudinary:ApiKey"];
        var apiSecret = configuration["Cloudinary:ApiSecret"];

        var account = new Account(cloudName, apiKey, apiSecret);
        _cloudinary = new Cloudinary(account);
    }

    public async Task<string> UploadImageAsync(Stream imageStream, string fileName)
    {
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(fileName, imageStream),
            Folder = "acargroup/jobs", // Organize by folder
            Transformation = new Transformation()
                .Quality("auto") // Auto optimize
                .FetchFormat("auto"), // Best format (WebP if supported)
            UseFilename = true,
            UniqueFilename = true,
            Overwrite = false
        };

        var uploadResult = await _cloudinary.UploadAsync(uploadParams);

        if (uploadResult.Error != null)
        {
            throw new Exception($"Cloudinary upload error: {uploadResult.Error.Message}");
        }

        return uploadResult.SecureUrl.ToString();
    }

    public async Task<bool> DeleteImageAsync(string publicId)
    {
        var deleteParams = new DeletionParams(publicId);
        var result = await _cloudinary.DestroyAsync(deleteParams);
        return result.Result == "ok";
    }
}
