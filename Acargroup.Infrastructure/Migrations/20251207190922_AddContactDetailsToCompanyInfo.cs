using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acargroup.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddContactDetailsToCompanyInfo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "CompanyInfos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "CompanyInfos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MapUrl",
                table: "CompanyInfos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "CompanyInfos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WhatsappNumber",
                table: "CompanyInfos",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Address",
                table: "CompanyInfos");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "CompanyInfos");

            migrationBuilder.DropColumn(
                name: "MapUrl",
                table: "CompanyInfos");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "CompanyInfos");

            migrationBuilder.DropColumn(
                name: "WhatsappNumber",
                table: "CompanyInfos");
        }
    }
}
