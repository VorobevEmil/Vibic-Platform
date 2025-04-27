using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChatChannelService.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDisplayNameColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DisplayName",
                table: "ChatUsers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");
            
            migrationBuilder.Sql(
                "UPDATE \"ChatUsers\" SET \"DisplayName\" = \"Username\""
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DisplayName",
                table: "ChatUsers");
        }
    }
}
