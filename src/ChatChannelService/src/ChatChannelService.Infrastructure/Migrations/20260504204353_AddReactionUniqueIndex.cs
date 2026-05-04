using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChatChannelService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddReactionUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reactions_MessageId",
                table: "Reactions");

            migrationBuilder.CreateIndex(
                name: "IX_Reactions_MessageId_UserId_Emoji",
                table: "Reactions",
                columns: new[] { "MessageId", "UserId", "Emoji" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reactions_MessageId_UserId_Emoji",
                table: "Reactions");

            migrationBuilder.CreateIndex(
                name: "IX_Reactions_MessageId",
                table: "Reactions",
                column: "MessageId");
        }
    }
}
