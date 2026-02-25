using Acargroup.Application.DTOs;

namespace Acargroup.Application.Interfaces;

public interface ICompanyInfoService
{
    Task<CompanyInfoDto?> GetAsync();
    Task<CompanyInfoDto> CreateOrUpdateAsync(CompanyInfoCreateUpdateDto dto);
}
