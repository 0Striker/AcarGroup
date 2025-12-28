using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acargroup.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAddressAndTCToPersonnel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Personnel",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TC",
                table: "Personnel",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Address",
                table: "Personnel");

            migrationBuilder.DropColumn(
                name: "TC",
                table: "Personnel");
        }
    }
}
