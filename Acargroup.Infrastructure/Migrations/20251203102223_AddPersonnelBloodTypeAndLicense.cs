using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acargroup.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPersonnelBloodTypeAndLicense : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BloodType",
                table: "Personnel",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "HasDriverLicense",
                table: "Personnel",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BloodType",
                table: "Personnel");

            migrationBuilder.DropColumn(
                name: "HasDriverLicense",
                table: "Personnel");
        }
    }
}
