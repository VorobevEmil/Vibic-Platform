using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChatChannelService.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AlterIconUrl_AlterOwnerId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "IconUrl",
                table: "Servers",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Servers_OwnerId",
                table: "Servers",
                column: "OwnerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Servers_ChatUsers_OwnerId",
                table: "Servers",
                column: "OwnerId",
                principalTable: "ChatUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Servers_ChatUsers_OwnerId",
                table: "Servers");

            migrationBuilder.DropIndex(
                name: "IX_Servers_OwnerId",
                table: "Servers");

            migrationBuilder.DropColumn(
                name: "IconUrl",
                table: "Servers");
        }
    }
}
