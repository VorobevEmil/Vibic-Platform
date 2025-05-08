using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChatChannelService.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class RenameTypeField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Type",
                table: "Channels",
                newName: "ChannelType");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ChannelType",
                table: "Channels",
                newName: "Type");
        }
    }
}
