using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acargroup.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerAddressToSupportTickets : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CustomerAddressId",
                table: "SupportTickets",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SupportTickets_CustomerAddressId",
                table: "SupportTickets",
                column: "CustomerAddressId");

            migrationBuilder.AddForeignKey(
                name: "FK_SupportTickets_CustomerAddresses_CustomerAddressId",
                table: "SupportTickets",
                column: "CustomerAddressId",
                principalTable: "CustomerAddresses",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SupportTickets_CustomerAddresses_CustomerAddressId",
                table: "SupportTickets");

            migrationBuilder.DropIndex(
                name: "IX_SupportTickets_CustomerAddressId",
                table: "SupportTickets");

            migrationBuilder.DropColumn(
                name: "CustomerAddressId",
                table: "SupportTickets");
        }
    }
}
