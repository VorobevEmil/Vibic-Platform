FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

ARG NUGET_GITHUB_TOKEN

WORKDIR /src

COPY src/MediaService/MediaService.sln ./src/MediaService/
COPY src/MediaService/src/MediaService.Application/MediaService.Application.csproj ./src/MediaService/src/MediaService.Application/
COPY src/MediaService/src/MediaService.Core/MediaService.Core.csproj ./src/MediaService/src/MediaService.Core/
COPY src/MediaService/src/MediaService.Infrastructure/MediaService.Infrastructure.csproj ./src/MediaService/src/MediaService.Infrastructure/
COPY src/MediaService/src/MediaService.Web/MediaService.Web.csproj ./src/MediaService/src/MediaService.Web/

RUN dotnet nuget add source "https://nuget.pkg.github.com/VorobevEmil/index.json" \
    --name github --username VorobevEmil --password "${NUGET_GITHUB_TOKEN}" --store-password-in-clear-text \
    && dotnet restore src/MediaService/src/MediaService.Web/MediaService.Web.csproj

COPY . .

WORKDIR /src/src/MediaService/src/MediaService.Web
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime

RUN apt-get update \
    && apt-get install -y libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 7139
ENV ASPNETCORE_URLS=http://0.0.0.0:7139

ENTRYPOINT ["dotnet", "MediaService.Web.dll"]
