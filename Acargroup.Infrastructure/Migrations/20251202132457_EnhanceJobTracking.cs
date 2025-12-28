using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Acargroup.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EnhanceJobTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Jobs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedAt",
                table: "Jobs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactPerson",
                table: "Jobs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactPhone",
                table: "Jobs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EstimatedHours",
                table: "Jobs",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PhotoUrls",
                table: "Jobs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Priority",
                table: "Jobs",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "RequiredMaterials",
                table: "Jobs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ScheduledDate",
                table: "Jobs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "StartedAt",
                table: "Jobs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "JobChecklists",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    JobId = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    IsCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedByPersonnelId = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobChecklists", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JobChecklists_Jobs_JobId",
                        column: x => x.JobId,
                        principalTable: "Jobs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_JobChecklists_Personnel_CompletedByPersonnelId",
                        column: x => x.CompletedByPersonnelId,
                        principalTable: "Personnel",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "JobTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    EstimatedCost = table.Column<decimal>(type: "numeric", nullable: false),
                    EstimatedHours = table.Column<int>(type: "integer", nullable: true),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    RequiredMaterials = table.Column<string>(type: "text", nullable: true),
                    ChecklistItems = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobTemplates", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_JobChecklists_CompletedByPersonnelId",
                table: "JobChecklists",
                column: "CompletedByPersonnelId");

            migrationBuilder.CreateIndex(
                name: "IX_JobChecklists_JobId",
                table: "JobChecklists",
                column: "JobId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "JobChecklists");

            migrationBuilder.DropTable(
                name: "JobTemplates");

            migrationBuilder.DropColumn(
                name: "Address",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "CompletedAt",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "ContactPerson",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "ContactPhone",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "EstimatedHours",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "PhotoUrls",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "Priority",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "RequiredMaterials",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "ScheduledDate",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "StartedAt",
                table: "Jobs");
        }
    }
}
