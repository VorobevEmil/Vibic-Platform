FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

ARG NUGET_GITHUB_TOKEN

WORKDIR /src

COPY src/FileService/FileService.sln ./src/FileService/
COPY src/FileService/src/FileProject.Core/FileProject.Core.csproj ./src/FileService/src/FileProject.Core/
COPY src/FileService/src/FileService.Application/FileService.Application.csproj ./src/FileService/src/FileService.Application/
COPY src/FileService/src/FileService.Infrastructure/FileService.Infrastructure.csproj ./src/FileService/src/FileService.Infrastructure/
COPY src/FileService/src/FileService.Web/FileService.Web.csproj ./src/FileService/src/FileService.Web/

RUN dotnet nuget add source "https://nuget.pkg.github.com/VorobevEmil/index.json" \
    --name github --username VorobevEmil --password "${NUGET_GITHUB_TOKEN}" --store-password-in-clear-text \
    && dotnet restore src/FileService/src/FileService.Web/FileService.Web.csproj

COPY . .

WORKDIR /src/src/FileService/src/FileService.Web
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime

RUN apt-get update \
    && apt-get install -y libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 7205
ENV ASPNETCORE_URLS=http://0.0.0.0:7205

ENTRYPOINT ["dotnet", "FileService.Web.dll"]
