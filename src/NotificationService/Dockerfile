FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

ARG NUGET_GITHUB_TOKEN

WORKDIR /src

COPY src/NotificationService/NotificationService.sln ./src/NotificationService/
COPY src/NotificationService/src/NotificationService.Application/NotificationService.Application.csproj ./src/NotificationService/src/NotificationService.Application/
COPY src/NotificationService/src/NotificationService.Core/NotificationService.Core.csproj ./src/NotificationService/src/NotificationService.Core/
COPY src/NotificationService/src/NotificationService.Infrastructure/NotificationService.Infrastructure.csproj ./src/NotificationService/src/NotificationService.Infrastructure/
COPY src/NotificationService/src/NotificationService.Web/NotificationService.Web.csproj ./src/NotificationService/src/NotificationService.Web/

RUN dotnet nuget add source "https://nuget.pkg.github.com/VorobevEmil/index.json" \
    --name github --username VorobevEmil --password "${NUGET_GITHUB_TOKEN}" --store-password-in-clear-text \
    && dotnet restore src/NotificationService/src/NotificationService.Web/NotificationService.Web.csproj

COPY . .

WORKDIR /src/src/NotificationService/src/NotificationService.Web
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime

RUN apt-get update \
    && apt-get install -y libkrb5-3 libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 7210
ENV ASPNETCORE_URLS=http://0.0.0.0:7210

ENTRYPOINT ["dotnet", "NotificationService.Web.dll"]
