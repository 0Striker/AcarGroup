using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acargroup.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddHddBrandToCustomerDevice : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "HddBrand",
                table: "CustomerDevices",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HddBrand",
                table: "CustomerDevices");
        }
    }
}
