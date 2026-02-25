using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Acargroup.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerDevices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CustomerDevices",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CustomerId = table.Column<int>(type: "integer", nullable: false),
                    CustomerPurchasedProductId = table.Column<int>(type: "integer", nullable: true),
                    DeviceUsername = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    DevicePassword = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    LocalIpAddress = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    MacAddress = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ModemInfo = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    HasInternetMonitoring = table.Column<bool>(type: "boolean", nullable: false),
                    SerialNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    QrCodeUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerDevices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomerDevices_CustomerPurchasedProducts_CustomerPurchased~",
                        column: x => x.CustomerPurchasedProductId,
                        principalTable: "CustomerPurchasedProducts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_CustomerDevices_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CustomerDevices_CustomerId",
                table: "CustomerDevices",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerDevices_CustomerPurchasedProductId",
                table: "CustomerDevices",
                column: "CustomerPurchasedProductId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CustomerDevices");
        }
    }
}
