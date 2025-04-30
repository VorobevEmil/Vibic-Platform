FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

WORKDIR /src

COPY ChatChannelService.sln ./
COPY src/ChatChannelService.Application/ChatChannelService.Application.csproj ./src/ChatChannelService.Application/
COPY src/ChatChannelService.Core/ChatChannelService.Core.csproj ./src/ChatChannelService.Core/
COPY src/ChatChannelService.Infrastructure/ChatChannelService.Infrastructure.csproj ./src/ChatChannelService.Infrastructure/
COPY src/ChatChannelService.Web/ChatChannelService.Web.csproj ./src/ChatChannelService.Web/

RUN dotnet nuget add source --username VorobevEmil --store-password-in-clear-text --name github "https://nuget.pkg.github.com/VorobevEmil/index.json"

RUN dotnet restore src/ChatChannelService.Web/ChatChannelService.Web.csproj

COPY . .

WORKDIR /src/src/ChatChannelService.Web
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime

WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 7138

ENTRYPOINT ["dotnet", "ChatChannelService.Web.dll", "--urls", "http://0.0.0.0:7138"]
