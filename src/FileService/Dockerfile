FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

WORKDIR /src

COPY FileService.sln ./
COPY src/FileService.Application/FileService.Application.csproj ./src/FileService.Application/
# COPY src/FileService.Core/FileService.Core.csproj ./src/FileService.Core/
COPY src/FileService.Infrastructure/FileService.Infrastructure.csproj ./src/FileService.Infrastructure/
COPY src/FileService.Web/FileService.Web.csproj ./src/FileService.Web/

RUN dotnet restore src/FileService.Web/FileService.Web.csproj

COPY . .

WORKDIR /src/src/FileService.Web
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime

WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 7205

ENTRYPOINT ["dotnet", "FileService.Web.dll", "--urls", "http://0.0.0.0:7205"]
