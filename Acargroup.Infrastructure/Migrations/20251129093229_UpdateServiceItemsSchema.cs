using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acargroup.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateServiceItemsSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"UPDATE ""ServiceItems"" SET ""Notes"" = '' WHERE ""Notes"" IS NULL;");

            migrationBuilder.RenameColumn(
                name: "ProductName",
                table: "ServiceItems",
                newName: "Title");

            migrationBuilder.RenameColumn(
                name: "Notes",
                table: "ServiceItems",
                newName: "Description");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "ServiceItems",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AdminNote",
                table: "ServiceItems",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PhotoPath",
                table: "ServiceItems",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdminNote",
                table: "ServiceItems");

            migrationBuilder.DropColumn(
                name: "PhotoPath",
                table: "ServiceItems");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "ServiceItems",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000);

            migrationBuilder.RenameColumn(
                name: "Title",
                table: "ServiceItems",
                newName: "ProductName");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "ServiceItems",
                newName: "Notes");
        }
    }
}
