FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

WORKDIR /src

COPY ./UserService.sln ./
COPY src/UserService.Application/UserService.Application.csproj ./src/UserService.Application/
COPY src/UserService.Core/UserService.Core.csproj ./src/UserService.Core/
COPY src/UserService.Infrastructure/UserService.Infrastructure.csproj ./src/UserService.Infrastructure/
COPY src/UserService.Web/UserService.Web.csproj ./src/UserService.Web/

RUN dotnet restore src/UserService.Web/UserService.Web.csproj

COPY . .

WORKDIR /src/src/UserService.Web
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime

WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 7155

ENTRYPOINT ["dotnet", "UserService.Web.dll", "--urls", "http://0.0.0.0:7155"]
