FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

ARG NUGET_GITHUB_TOKEN

WORKDIR /src

COPY ./UserService.sln ./
COPY src/UserService.Application/UserService.Application.csproj ./src/UserService.Application/
COPY src/UserService.Core/UserService.Core.csproj ./src/UserService.Core/
COPY src/UserService.Infrastructure/UserService.Infrastructure.csproj ./src/UserService.Infrastructure/
COPY src/UserService.Web/UserService.Web.csproj ./src/UserService.Web/

RUN dotnet nuget add source "https://nuget.pkg.github.com/VorobevEmil/index.json" \
    --name github --username VorobevEmil --password "${NUGET_GITHUB_TOKEN}" --store-password-in-clear-text \
    && dotnet restore src/UserService.Web/UserService.Web.csproj

COPY . .

WORKDIR /src/src/UserService.Web
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime

RUN apt-get update \
    && apt-get install -y libkrb5-3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 7155
ENV ASPNETCORE_URLS=http://0.0.0.0:7155

ENTRYPOINT ["dotnet", "UserService.Web.dll"]
