namespace Acargroup.Application.Interfaces;

public interface IFileUploadService
{
    /// <summary>
    /// Uploads an image to local file system
    /// </summary>
    /// <param name="imageStream">Image file stream</param>
    /// <param name="fileName">Original file name</param>
    /// <param name="folder">Subfolder within uploads directory (e.g., "products", "projects")</param>
    /// <returns>Relative URL path to the uploaded file (e.g., "/uploads/products/abc123_image.jpg")</returns>
    Task<string> UploadImageAsync(Stream imageStream, string fileName, string folder);

    /// <summary>
    /// Deletes an image from local file system
    /// </summary>
    /// <param name="filePath">Relative file path (e.g., "/uploads/products/abc123_image.jpg")</param>
    /// <returns>True if deletion was successful</returns>
    Task<bool> DeleteImageAsync(string filePath);

    /// <summary>
    /// Gets the full URL for an image
    /// </summary>
    /// <param name="filePath">Relative file path</param>
    /// <returns>Full URL path</returns>
    string GetImageUrl(string filePath);
}
