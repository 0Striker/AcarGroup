using Acargroup.Application.DTOs;

namespace Acargroup.Application.Interfaces;

public interface IAdminService
{
    Task<AdminSummaryDto> GetSummaryAsync();
}
