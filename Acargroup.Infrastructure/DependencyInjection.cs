using Acargroup.Application.Interfaces;
using Acargroup.Application.Services;
using Acargroup.Infrastructure.Persistence.Contexts;
using Acargroup.Infrastructure.Persistence.Repositories;
using Acargroup.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Acargroup.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureLayer(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<AcargroupDbContext>(options =>
            options.UseNpgsql(connectionString));

        // Repositories
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IOfferRepository, OfferRepository>();

        // Services
        services.AddScoped<IProjectRequestService, ProjectRequestService>();
        services.AddScoped<IProjectRequestAdminService, ProjectRequestAdminService>();
        services.AddScoped<IAdminService, AdminService>();
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<ICustomerProfileService, CustomerProfileService>(); // Added missing service
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ISupportTicketService, SupportTicketService>();
        services.AddScoped<ICustomerAddressService, CustomerAddressService>();
        services.AddScoped<IServiceItemService, ServiceItemService>();
        services.AddScoped<IProjectService, ProjectService>();
        services.AddScoped<IProjectAdminService, ProjectAdminService>();
        services.AddScoped<IReferenceService, ReferenceService>();
        services.AddScoped<IReferenceAdminService, ReferenceAdminService>();
        services.AddScoped<ICompanyInfoService, CompanyInfoService>();
        services.AddScoped<IBrandService, BrandService>();
        services.AddScoped<IOfferService, OfferService>();
        services.AddScoped<IInternetApplicationService, InternetApplicationService>();
        services.AddScoped<IHistoryService, HistoryService>();
        
        // Technical Service Management System
        services.AddScoped<IPersonnelService, PersonnelService>();
        services.AddScoped<IJobService, JobService>();
        services.AddScoped<IFinanceService, FinanceService>();
        services.AddScoped<IAccountingService, AccountingService>();
        services.AddScoped<ICompanyPaymentService, CompanyPaymentService>();
        services.AddScoped<ICalendarService, CalendarService>();
        services.AddScoped<ICustomerPurchasedProductService, CustomerPurchasedProductService>();
        services.AddScoped<ICustomerDocumentService, CustomerDocumentService>();
        services.AddScoped<ICustomerDeviceService, CustomerDeviceService>();
        services.AddScoped<IReminderService, ReminderService>();
        
        // Cloud Services
        services.AddScoped<ICloudinaryService, CloudinaryService>();

        return services;
    }
}
