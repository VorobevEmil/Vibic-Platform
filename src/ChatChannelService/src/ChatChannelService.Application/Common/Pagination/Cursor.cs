using System.Text;
using System.Text.Json;

namespace ChatChannelService.Application.Common.Pagination;

public sealed record Cursor(DateTime DateTime, Guid LastId)
{
    public static string Encode(DateTime date, Guid lastId)
    {
        Cursor cursor = new(date, lastId);
        string json = JsonSerializer.Serialize(cursor);
        string base64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(json));
        return base64;
    }

    public static Cursor? Decode(string? cursor)
    {
        if (string.IsNullOrWhiteSpace(cursor))
        {
            return null;
        }

        try
        {
            string json = Encoding.UTF8.GetString(Convert.FromBase64String(cursor));
            return JsonSerializer.Deserialize<Cursor>(json);

        }
        catch
        {
            return null;
        }
    }
}