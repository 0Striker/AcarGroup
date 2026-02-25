using Acargroup.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Acargroup.Application.Services
{
    public interface IBrandService
    {
        Task<IEnumerable<Brand>> GetActiveBrandsAsync();
        Task<IEnumerable<Brand>> GetAllBrandsAsync();
        Task<Brand?> GetBrandByIdAsync(int id);
        Task<Brand> CreateBrandAsync(Brand brand);
        Task UpdateBrandAsync(Brand brand);
        Task DeleteBrandAsync(int id);
    }
}
