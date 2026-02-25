using Acargroup.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Acargroup.Infrastructure.Persistence.Contexts;

public class AcargroupDbContext : DbContext
{
    public AcargroupDbContext(DbContextOptions<AcargroupDbContext> options) : base(options)
    {
    }

    public DbSet<Category> Categories { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<ProjectRequest> ProjectRequests { get; set; }
    public DbSet<Customer> Customers { get; set; }
    public DbSet<SupportTicket> SupportTickets { get; set; }
    public DbSet<Company> Companies { get; set; }
    public DbSet<ShippingCompany> ShippingCompanies { get; set; }
    public DbSet<CustomerAddress> CustomerAddresses { get; set; }
    public DbSet<ServiceItem> ServiceItems { get; set; }
    public DbSet<ServiceItemStatusHistory> ServiceItemStatusHistories { get; set; }
    public DbSet<HomepageServiceItem> HomepageServices { get; set; }
    public DbSet<Project> Projects { get; set; }
    public DbSet<Reference> References { get; set; }
    public DbSet<Brand> Brands { get; set; }
    public DbSet<CompanyInfo> CompanyInfos { get; set; }
    public DbSet<Offer> Offers { get; set; }
    public DbSet<OfferItem> OfferItems { get; set; }
    public DbSet<InternetApplication> InternetApplications { get; set; }
    public DbSet<History> Histories { get; set; }
    
    // Technical Service Management System
    public DbSet<Personnel> Personnel { get; set; }
    public DbSet<Job> Jobs { get; set; }
    public DbSet<JobHistory> JobHistories { get; set; }
    public DbSet<CustomerBalance> CustomerBalances { get; set; }
    public DbSet<CustomerPurchasedProduct> CustomerPurchasedProducts { get; set; }
    public DbSet<FinanceTransaction> FinanceTransactions { get; set; }
    public DbSet<ScheduledJob> ScheduledJobs { get; set; }
    public DbSet<JobChecklist> JobChecklists { get; set; }
    public DbSet<JobTemplate> JobTemplates { get; set; }
    public DbSet<CustomerDocument> CustomerDocuments { get; set; }
    public DbSet<CustomerDevice> CustomerDevices { get; set; }
    
    // Accounting Module
    public DbSet<AccountingExpense> AccountingExpenses { get; set; }
    public DbSet<CompanyPayment> CompanyPayments { get; set; }
    public DbSet<Reminder> Reminders { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Category entity
        modelBuilder.Entity<Category>(entity =>
        {
            entity.ToTable("Categories");
            
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(150);
            
            entity.Property(e => e.Description)
                .HasMaxLength(500);
            
            entity.HasMany(e => e.Products)
                .WithOne(e => e.Category)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure Product entity
        modelBuilder.Entity<Product>(entity =>
        {
            entity.ToTable("Products");
            
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(150);
            
            entity.Property(e => e.Description)
                .HasMaxLength(1000);
            
            entity.Property(e => e.Price)
                .HasColumnType("numeric(18,2)")
                .IsRequired();
            
            entity.Property(e => e.IsActive)
                .IsRequired()
                .HasDefaultValue(true);
        });

        // Configure Customer entity
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.ToTable("Customers");
            
            entity.Property(e => e.FullName)
                .IsRequired()
                .HasMaxLength(150);
            
            entity.Property(e => e.Email)
                .IsRequired()
                .HasMaxLength(200);
            
            entity.HasIndex(e => e.Email)
                .IsUnique();
            
            entity.Property(e => e.Phone)
                .IsRequired()
                .HasMaxLength(30);
            
            entity.Property(e => e.PasswordHash)
                .IsRequired();
            
            entity.Property(e => e.PasswordSalt)
                .IsRequired();
            
            entity.Property(e => e.IsActive)
                .IsRequired()
                .HasDefaultValue(true);
        });

        // Configure SupportTicket entity
        modelBuilder.Entity<SupportTicket>(entity =>
        {
            entity.ToTable("SupportTickets");
            
            entity.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(200);
            
            entity.Property(e => e.Description)
                .IsRequired()
                .HasMaxLength(2000);
            
            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(50);
            
            entity.Property(e => e.ProductName)
                .HasMaxLength(200);
            
            entity.Property(e => e.SerialNumber)
                .HasMaxLength(100);
            
            entity.Property(e => e.ImagePath)
                .HasMaxLength(500);
            
            entity.HasOne(e => e.Customer)
                .WithMany()
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure CustomerAddress entity
        modelBuilder.Entity<CustomerAddress>(entity =>
        {
            entity.ToTable("CustomerAddresses");
            
            entity.Property(e => e.Label)
                .IsRequired()
                .HasMaxLength(100);
            
            entity.Property(e => e.City)
                .IsRequired()
                .HasMaxLength(100);
            
            entity.Property(e => e.District)
                .IsRequired()
                .HasMaxLength(100);
            
            entity.Property(e => e.FullAddress)
                .IsRequired()
                .HasMaxLength(500);
            
            entity.Property(e => e.PostalCode)
                .HasMaxLength(20);
            
            entity.Property(e => e.Notes)
                .HasMaxLength(1000);
            
            entity.Property(e => e.IsDefault)
                .IsRequired()
                .HasDefaultValue(false);
            
            entity.HasOne(e => e.Customer)
                .WithMany(c => c.Addresses)
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ServiceItem>(entity =>
        {
            entity.ToTable("ServiceItems");
            
            entity.Property(e => e.CreatedAt)
                .ValueGeneratedOnAdd()
                .HasDefaultValueSql("NOW()");
            
            entity.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(200);
            
            entity.Property(e => e.Description)
                .IsRequired()
                .HasMaxLength(2000);
            
            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(50);
            
            entity.Property(e => e.AdminNote)
                .HasMaxLength(2000);
            
            entity.Property(e => e.PhotoPath)
                .HasMaxLength(500);
            
            entity.HasOne(e => e.Customer)
                .WithMany()
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasMany(e => e.StatusHistories)
                .WithOne(e => e.ServiceItem)
                .HasForeignKey(e => e.ServiceItemId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ServiceItemStatusHistory>(entity =>
        {
            entity.ToTable("ServiceItemStatusHistories");

            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.Note)
                .HasMaxLength(2000);

            entity.Property(e => e.ChangedBy)
                .IsRequired()
                .HasMaxLength(150);

            entity.HasOne(e => e.ServiceItem)
                .WithMany(e => e.StatusHistories)
                .HasForeignKey(e => e.ServiceItemId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure Project entity
        modelBuilder.Entity<Project>(entity =>
        {
            entity.ToTable("Projects");
            
            entity.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(200);
            
            entity.Property(e => e.Slug)
                .IsRequired()
                .HasMaxLength(200);
            
            entity.HasIndex(e => e.Slug)
                .IsUnique();
            
            entity.Property(e => e.ShortDescription)
                .IsRequired()
                .HasMaxLength(500);
            
            entity.Property(e => e.LongDescription)
                .IsRequired()
                .HasMaxLength(4000);
            
            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(50);
            
            entity.Property(e => e.City)
                .HasMaxLength(100);
            
            entity.Property(e => e.ClientName)
                .HasMaxLength(200);
        });

        // Configure ProjectRequest entity
        modelBuilder.Entity<ProjectRequest>(entity =>
        {
            entity.ToTable("ProjectRequests");

            entity.Property(e => e.ProjectType)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.City)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.District)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.FullName)
                .IsRequired()
                .HasMaxLength(150);

            entity.Property(e => e.Phone)
                .IsRequired()
                .HasMaxLength(30);

            entity.Property(e => e.Address)
                .IsRequired();

            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(50)
                .HasDefaultValue("New");
            
            entity.Property(e => e.IsArchived)
                .IsRequired()
                .HasDefaultValue(false);
        });



        // Configure Project entity
        modelBuilder.Entity<Project>(entity =>
        {
            entity.ToTable("Projects");

            entity.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.Slug)
                .IsRequired()
                .HasMaxLength(200);
            
            entity.HasIndex(e => e.Slug)
                .IsUnique();

            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.City).HasMaxLength(150);
            entity.Property(e => e.District).HasMaxLength(150);
            entity.Property(e => e.ClientName).HasMaxLength(150);
            entity.Property(e => e.HeroImageUrl).HasMaxLength(500);
            
            entity.Property(e => e.DisplayOrder).HasDefaultValue(0);
            entity.Property(e => e.IsFeatured).HasDefaultValue(false);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
        });

        // Configure Reference entity
        modelBuilder.Entity<Reference>(entity =>
        {
            entity.ToTable("References");

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.LogoUrl).HasMaxLength(500);
            entity.Property(e => e.WebsiteUrl).HasMaxLength(500);
            entity.Property(e => e.Description).HasMaxLength(1000);
            
            entity.Property(e => e.DisplayOrder).HasDefaultValue(0);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
        });

        // Configure CompanyInfo entity
        modelBuilder.Entity<CompanyInfo>(entity =>
        {
            entity.ToTable("CompanyInfos");

            entity.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.Subtitle)
                .IsRequired()
                .HasMaxLength(300);

            entity.Property(e => e.Content)
                .IsRequired();

            entity.Property(e => e.HeroImageUrl).HasMaxLength(500);
            entity.Property(e => e.SliderImageUrl1).HasMaxLength(500);
            entity.Property(e => e.SliderImageUrl2).HasMaxLength(500);
            entity.Property(e => e.SliderImageUrl3).HasMaxLength(500);
            entity.Property(e => e.SliderImageUrl3).HasMaxLength(500);
        });

        // Configure Brand entity
        modelBuilder.Entity<Brand>(entity =>
        {
            entity.ToTable("Brands");

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.LogoUrl).HasMaxLength(500);
            
            entity.Property(e => e.DisplayOrder).HasDefaultValue(0);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
        });

        // Configure Offer entity
        modelBuilder.Entity<Offer>(entity =>
        {
            entity.ToTable("Offers");

            entity.Property(e => e.CustomerName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.CustomerEmail).HasMaxLength(200);
            entity.Property(e => e.CustomerPhone).HasMaxLength(50);
            entity.Property(e => e.CustomerAddress).HasMaxLength(500);
            
            entity.Property(e => e.OfferNumber).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.OfferNumber).IsUnique();
            
            entity.Property(e => e.Currency).IsRequired().HasMaxLength(10).HasDefaultValue("USD");
            entity.Property(e => e.ExchangeRate).HasColumnType("numeric(18,4)");
            
            entity.Property(e => e.SubTotal).HasColumnType("numeric(18,2)");
            entity.Property(e => e.TaxRate).HasColumnType("numeric(18,2)");
            entity.Property(e => e.TaxAmount).HasColumnType("numeric(18,2)");
            entity.Property(e => e.GrandTotal).HasColumnType("numeric(18,2)");
            
            entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
            
            entity.HasOne(e => e.Customer)
                .WithMany()
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.SetNull);
                
            entity.HasMany(e => e.Items)
                .WithOne(e => e.Offer)
                .HasForeignKey(e => e.OfferId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure OfferItem entity
        modelBuilder.Entity<OfferItem>(entity =>
        {
            entity.ToTable("OfferItems");

            entity.Property(e => e.ProductName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Unit).IsRequired().HasMaxLength(50);
            
            entity.Property(e => e.Quantity).HasColumnType("numeric(18,2)");
            entity.Property(e => e.UnitPrice).HasColumnType("numeric(18,2)");
            entity.Property(e => e.TotalPrice).HasColumnType("numeric(18,2)");
            
            entity.HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Configure CustomerDevice entity
        modelBuilder.Entity<CustomerDevice>(entity =>
        {
            entity.ToTable("CustomerDevices");

            entity.Property(e => e.DeviceType).IsRequired().HasMaxLength(50).HasDefaultValue("Recording");
            
            entity.Property(e => e.DeviceUsername).HasMaxLength(100);
            entity.Property(e => e.DevicePassword).HasMaxLength(100);
            entity.Property(e => e.LocalIpAddress).HasMaxLength(50);
            entity.Property(e => e.MacAddress).HasMaxLength(50);
            entity.Property(e => e.ModemInfo).HasMaxLength(200);
            entity.Property(e => e.ModemPassword).HasMaxLength(100);
            entity.Property(e => e.SerialNumber).HasMaxLength(100);
            entity.Property(e => e.QrCodeUrl).HasMaxLength(500);
            
            entity.Property(e => e.DeviceAddress).HasMaxLength(500);
            entity.Property(e => e.CameraNotes).HasMaxLength(1000);
            
            entity.Property(e => e.HddSerialNumber).HasMaxLength(100);
            entity.Property(e => e.HddImporter).HasMaxLength(200);
            entity.Property(e => e.HddCapacity).HasMaxLength(50);
            
            entity.HasOne(e => e.Customer)
                .WithMany()
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasOne(e => e.PurchasedProduct)
                .WithMany()
                .HasForeignKey(e => e.CustomerPurchasedProductId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Global configuration for BaseEntity timestamps
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            // Check if entity has CreatedAt property
            var createdAtProperty = entityType.FindProperty("CreatedAt");
            if (createdAtProperty != null)
            {
                modelBuilder.Entity(entityType.ClrType)
                    .Property<DateTime>("CreatedAt")
                    .IsRequired()
                    .HasDefaultValueSql("NOW()");
            }

            // Check if entity has UpdatedAt property
            var updatedAtProperty = entityType.FindProperty("UpdatedAt");
            if (updatedAtProperty != null)
            {
                modelBuilder.Entity(entityType.ClrType)
                    .Property<DateTime?>("UpdatedAt");
            }
        }
    }
}
