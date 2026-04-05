FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

ARG NUGET_GITHUB_TOKEN

WORKDIR /src

COPY src/ChatChannelService/ChatChannelService.sln ./src/ChatChannelService/
COPY src/ChatChannelService/src/ChatChannelService.Application/ChatChannelService.Application.csproj ./src/ChatChannelService/src/ChatChannelService.Application/
COPY src/ChatChannelService/src/ChatChannelService.Core/ChatChannelService.Core.csproj ./src/ChatChannelService/src/ChatChannelService.Core/
COPY src/ChatChannelService/src/ChatChannelService.Infrastructure/ChatChannelService.Infrastructure.csproj ./src/ChatChannelService/src/ChatChannelService.Infrastructure/
COPY src/ChatChannelService/src/ChatChannelService.Shared/ChatChannelService.Shared.csproj ./src/ChatChannelService/src/ChatChannelService.Shared/
COPY src/ChatChannelService/src/ChatChannelService.Web/ChatChannelService.Web.csproj ./src/ChatChannelService/src/ChatChannelService.Web/
COPY ["src/Vibic Libraries/Vibic.Shared.Messaging/Vibic.Shared.Messaging/Vibic.Shared.Messaging.csproj", "./src/Vibic Libraries/Vibic.Shared.Messaging/Vibic.Shared.Messaging/"]

RUN dotnet nuget add source "https://nuget.pkg.github.com/VorobevEmil/index.json" \
    --name github --username VorobevEmil --password "${NUGET_GITHUB_TOKEN}" --store-password-in-clear-text \
    && dotnet restore src/ChatChannelService/src/ChatChannelService.Web/ChatChannelService.Web.csproj

COPY . .

WORKDIR /src/src/ChatChannelService/src/ChatChannelService.Web
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime

RUN apt-get update \
    && apt-get install -y libkrb5-3 libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 7138
ENV ASPNETCORE_URLS=http://0.0.0.0:7138

ENTRYPOINT ["dotnet", "ChatChannelService.Web.dll"]
