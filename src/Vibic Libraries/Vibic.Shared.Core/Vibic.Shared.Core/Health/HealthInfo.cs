namespace Vibic.Shared.Core.Health;

public sealed record HealthInfo(
    string Status,
    string Service,
    string Environment,
    VersionInfo Version,
    DateTime Timestamp);

public sealed record VersionInfo(
    string Semver,
    string InformationalVersion,
    string AssemblyVersion);
