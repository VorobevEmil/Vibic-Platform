FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

WORKDIR /src

COPY OAuthServer.sln ./
COPY src/OAuthServer.Application/OAuthServer.Application.csproj ./src/OAuthServer.Application/
COPY src/OAuthServer.Core/OAuthServer.Core.csproj ./src/OAuthServer.Core/
COPY src/OAuthServer.Infrastructure/OAuthServer.Infrastructure.csproj ./src/OAuthServer.Infrastructure/
COPY src/OAuthServer.Web/OAuthServer.Web.csproj ./src/OAuthServer.Web/

RUN dotnet restore src/OAuthServer.Web/OAuthServer.Web.csproj

COPY . .

WORKDIR /src/src/OAuthServer.Web
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime

WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 7154

ENTRYPOINT ["dotnet", "OAuthServer.Web.dll", "--urls", "http://0.0.0.0:7154"]
