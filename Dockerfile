# Build Stage
FROM mcr.microsoft.com/dotnet/core/sdk:2.2 AS build
WORKDIR /app

# Copy solution and project files and restore dependencies
COPY *.sln .

# Copy SampleApp project files
COPY SampleApp/*.csproj ./SampleApp/

# Add lines to copy csproj files for each test project
COPY SampleApp.UnitTests/*.csproj ./SampleApp.UnitTests/
COPY SampleApp.IntegrationTests/*.csproj ./SampleApp.IntegrationTests/
COPY SampleApp.FunctionalTests/*.csproj ./SampleApp.FunctionalTests/

# Run dotnet restore
RUN dotnet restore

# Copy the rest of the source code and build the app
COPY SampleApp/. ./SampleApp/

# Add lines to copy the rest of the source for each test project
COPY SampleApp.UnitTests/. ./SampleApp.UnitTests/
COPY SampleApp.IntegrationTests/. ./SampleApp.IntegrationTests/
COPY SampleApp.FunctionalTests/. ./SampleApp.FunctionalTests/

WORKDIR /app/SampleApp
RUN dotnet publish -c Release -o out

# Runtime Stage
FROM mcr.microsoft.com/dotnet/core/aspnet:2.2 AS runtime
WORKDIR /app

# Copy compiled binaries from the build stage
COPY --from=build /app/SampleApp/out ./

# Set the entry point for the application
ENTRYPOINT ["dotnet", "SampleApp.dll"]
