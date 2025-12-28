using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acargroup.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddQuickSettingsToCompanyInfo_Retry : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LogoText",
                table: "CompanyInfos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "ShowCurrencyRates",
                table: "CompanyInfos",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "TickerText",
                table: "CompanyInfos",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LogoText",
                table: "CompanyInfos");

            migrationBuilder.DropColumn(
                name: "ShowCurrencyRates",
                table: "CompanyInfos");

            migrationBuilder.DropColumn(
                name: "TickerText",
                table: "CompanyInfos");
        }
    }
}
