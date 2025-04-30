FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

WORKDIR /src

COPY MediaService.sln ./
COPY src/MediaService.Application/MediaService.Application.csproj ./src/MediaService.Application/
COPY src/MediaService.Core/MediaService.Core.csproj ./src/MediaService.Core/
COPY src/MediaService.Infrastructure/MediaService.Infrastructure.csproj ./src/MediaService.Infrastructure/
COPY src/MediaService.Web/MediaService.Web.csproj ./src/MediaService.Web/

RUN dotnet nuget add source --username VorobevEmil --store-password-in-clear-text --name github "https://nuget.pkg.github.com/VorobevEmil/index.json"

RUN dotnet restore src/MediaService.Web/MediaService.Web.csproj

COPY . .

WORKDIR /src/src/MediaService.Web
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime

WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 7139

ENTRYPOINT ["dotnet", "MediaService.Web.dll", "--urls", "http://0.0.0.0:7139"]
