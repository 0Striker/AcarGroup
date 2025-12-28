using Acargroup.Application.DTOs;
using Acargroup.Domain.Enums;

namespace Acargroup.Application.Interfaces;

public interface ICustomerDocumentService
{
    Task<List<CustomerDocumentDto>> GetByCustomerIdAsync(int customerId);
    Task<List<CustomerDocumentDto>> GetByCustomerAndTypeAsync(int customerId, DocumentType type);
    Task<CustomerDocumentDto> UploadAsync(Stream fileStream, string fileName, string contentType, int customerId, DocumentType type, string uploaderName);
    Task DeleteAsync(int id);
}
