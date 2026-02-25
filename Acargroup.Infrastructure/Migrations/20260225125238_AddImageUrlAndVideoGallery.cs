using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acargroup.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddImageUrlAndVideoGallery : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Histories",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GalleryImageUrls",
                table: "CompanyInfos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VideoUrl",
                table: "CompanyInfos",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Histories");

            migrationBuilder.DropColumn(
                name: "GalleryImageUrls",
                table: "CompanyInfos");

            migrationBuilder.DropColumn(
                name: "VideoUrl",
                table: "CompanyInfos");
        }
    }
}
