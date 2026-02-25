using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acargroup.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddVatCurrencyPaymentTypeToFinanceTransaction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Currency",
                table: "FinanceTransactions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsVatIncluded",
                table: "FinanceTransactions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PaymentType",
                table: "FinanceTransactions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "VatAmount",
                table: "FinanceTransactions",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "VatRate",
                table: "FinanceTransactions",
                type: "numeric",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Currency",
                table: "FinanceTransactions");

            migrationBuilder.DropColumn(
                name: "IsVatIncluded",
                table: "FinanceTransactions");

            migrationBuilder.DropColumn(
                name: "PaymentType",
                table: "FinanceTransactions");

            migrationBuilder.DropColumn(
                name: "VatAmount",
                table: "FinanceTransactions");

            migrationBuilder.DropColumn(
                name: "VatRate",
                table: "FinanceTransactions");
        }
    }
}
