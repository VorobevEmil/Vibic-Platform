FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

ARG NUGET_GITHUB_TOKEN

WORKDIR /src

COPY src/OAuthServer/OAuthServer.sln ./src/OAuthServer/
COPY src/OAuthServer/src/OAuthServer.Application/OAuthServer.Application.csproj ./src/OAuthServer/src/OAuthServer.Application/
COPY src/OAuthServer/src/OAuthServer.Core/OAuthServer.Core.csproj ./src/OAuthServer/src/OAuthServer.Core/
COPY src/OAuthServer/src/OAuthServer.Infrastructure/OAuthServer.Infrastructure.csproj ./src/OAuthServer/src/OAuthServer.Infrastructure/
COPY src/OAuthServer/src/OAuthServer.Web/OAuthServer.Web.csproj ./src/OAuthServer/src/OAuthServer.Web/

RUN dotnet nuget add source "https://nuget.pkg.github.com/VorobevEmil/index.json" \
    --name github --username VorobevEmil --password "${NUGET_GITHUB_TOKEN}" --store-password-in-clear-text \
    && dotnet restore src/OAuthServer/src/OAuthServer.Web/OAuthServer.Web.csproj

COPY . .

WORKDIR /src/src/OAuthServer/src/OAuthServer.Web
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime

RUN apt-get update \
    && apt-get install -y libkrb5-3 libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 7154
ENV ASPNETCORE_URLS=http://0.0.0.0:7154

ENTRYPOINT ["dotnet", "OAuthServer.Web.dll"]
