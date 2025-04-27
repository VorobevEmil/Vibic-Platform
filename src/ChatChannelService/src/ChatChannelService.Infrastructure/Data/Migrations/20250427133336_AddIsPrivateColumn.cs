using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChatChannelService.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddIsPrivateColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPrivate",
                table: "Channels",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPrivate",
                table: "Channels");
        }
    }
}
