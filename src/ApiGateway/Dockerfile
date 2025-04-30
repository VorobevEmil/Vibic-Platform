FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

WORKDIR /src

COPY ApiGateway.sln ./
# COPY src/ApiGateway.Application/ApiGateway.Application.csproj ./src/ApiGateway.Application/
# COPY src/ApiGateway.Core/ApiGateway.Core.csproj ./src/ApiGateway.Core/
# COPY src/ApiGateway.Infrastructure/ApiGateway.Infrastructure.csproj ./src/ApiGateway.Infrastructure/
COPY src/ApiGateway.Web/ApiGateway.Web.csproj ./src/ApiGateway.Web/

RUN dotnet nuget add source --username VorobevEmil --store-password-in-clear-text --name github "https://nuget.pkg.github.com/VorobevEmil/index.json"

RUN dotnet restore src/ApiGateway.Web/ApiGateway.Web.csproj

COPY . .

WORKDIR /src/src/ApiGateway.Web
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime

WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 7157

ENTRYPOINT ["dotnet", "ApiGateway.Web.dll", "--urls", "http://0.0.0.0:7157"]
