using Acargroup.Application.Interfaces;
using Acargroup.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Acargroup.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationLayer(this IServiceCollection services)
    {
        // Register services
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IProductService, ProductService>();
        
        return services;
    }
}
