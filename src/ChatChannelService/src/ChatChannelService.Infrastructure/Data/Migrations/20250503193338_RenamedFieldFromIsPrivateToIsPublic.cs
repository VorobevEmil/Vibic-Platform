using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChatChannelService.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class RenamedFieldFromIsPrivateToIsPublic : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE \"Channels\" SET \"IsPrivate\" = NOT \"IsPrivate\";");

            migrationBuilder.RenameColumn(
                name: "IsPrivate",
                table: "Channels",
                newName: "IsPublic");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IsPublic",
                table: "Channels",
                newName: "IsPrivate");
            
            migrationBuilder.Sql("UPDATE \"Channels\" SET \"IsPrivate\" = NOT \"IsPrivate\";");
        }
    }
}
