using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acargroup.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddExternalFieldsToFinanceTransaction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ExternalCustomerName",
                table: "FinanceTransactions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExternalJobTitle",
                table: "FinanceTransactions",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExternalCustomerName",
                table: "FinanceTransactions");

            migrationBuilder.DropColumn(
                name: "ExternalJobTitle",
                table: "FinanceTransactions");
        }
    }
}
