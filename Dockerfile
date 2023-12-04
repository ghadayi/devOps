# Build Stage
FROM mcr.microsoft.com/dotnet/core/sdk:2.2 AS build
WORKDIR /app

# Copy solution and project files and restore dependencies
COPY *.sln .
COPY SampleApp/*.csproj ./SampleApp/
RUN dotnet restore

# Copy the rest of the source code and build the app
COPY SampleApp/. ./SampleApp/
WORKDIR /app/SampleApp
RUN dotnet publish -c Release -o out

# Runtime Stage
FROM mcr.microsoft.com/dotnet/core/aspnet:2.2 AS runtime
WORKDIR /app

# Copy compiled binaries from the build stage
COPY --from=build /app/SampleApp/out ./

# Set the entry point for the application
ENTRYPOINT ["dotnet", "SampleApp.dll"]
