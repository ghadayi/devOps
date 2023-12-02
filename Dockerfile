# Use .net core SDK image
FROM mcr.microsoft.com/dotnet/core/sdk:2.2 AS build
#change the workdir to /app on the container
WORKDIR /app

# copy all necessary files and run dotnet restore to download all  the dependencies
COPY *.sln .
COPY SampleApp/*.csproj ./SampleApp/
RUN dotnet restore

# copy everything else and build the app
COPY SampleApp/. ./SampleApp/
WORKDIR /app/SampleApp
RUN dotnet publish -c Release -o out

# Use .net core runtime image
FROM mcr.microsoft.com/dotnet/core/aspnet:2.2 AS runtime
WORKDIR /app
#copy built files to the container
COPY --from=build /app/SampleApp/out ./
#run the app
ENTRYPOINT ["dotnet", "SampleApp.dll"]