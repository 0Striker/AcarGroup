using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acargroup.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerDeviceFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FinanceTransactions_Customers_CustomerId",
                table: "FinanceTransactions");

            migrationBuilder.AlterColumn<int>(
                name: "CustomerId",
                table: "FinanceTransactions",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<string>(
                name: "DeviceImporter",
                table: "CustomerDevices",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeviceModel",
                table: "CustomerDevices",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MaterialNotes",
                table: "CustomerDevices",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ModemSerialNumber",
                table: "CustomerDevices",
                type: "text",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_FinanceTransactions_Customers_CustomerId",
                table: "FinanceTransactions",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FinanceTransactions_Customers_CustomerId",
                table: "FinanceTransactions");

            migrationBuilder.DropColumn(
                name: "DeviceImporter",
                table: "CustomerDevices");

            migrationBuilder.DropColumn(
                name: "DeviceModel",
                table: "CustomerDevices");

            migrationBuilder.DropColumn(
                name: "MaterialNotes",
                table: "CustomerDevices");

            migrationBuilder.DropColumn(
                name: "ModemSerialNumber",
                table: "CustomerDevices");

            migrationBuilder.AlterColumn<int>(
                name: "CustomerId",
                table: "FinanceTransactions",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_FinanceTransactions_Customers_CustomerId",
                table: "FinanceTransactions",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
