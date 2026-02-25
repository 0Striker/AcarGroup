using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acargroup.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDeviceTypeAndExpandedFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CameraNotes",
                table: "CustomerDevices",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeviceAddress",
                table: "CustomerDevices",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeviceType",
                table: "CustomerDevices",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "Recording");

            migrationBuilder.AddColumn<string>(
                name: "HddCapacity",
                table: "CustomerDevices",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HddImporter",
                table: "CustomerDevices",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HddSerialNumber",
                table: "CustomerDevices",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ModemPassword",
                table: "CustomerDevices",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CameraNotes",
                table: "CustomerDevices");

            migrationBuilder.DropColumn(
                name: "DeviceAddress",
                table: "CustomerDevices");

            migrationBuilder.DropColumn(
                name: "DeviceType",
                table: "CustomerDevices");

            migrationBuilder.DropColumn(
                name: "HddCapacity",
                table: "CustomerDevices");

            migrationBuilder.DropColumn(
                name: "HddImporter",
                table: "CustomerDevices");

            migrationBuilder.DropColumn(
                name: "HddSerialNumber",
                table: "CustomerDevices");

            migrationBuilder.DropColumn(
                name: "ModemPassword",
                table: "CustomerDevices");
        }
    }
}
