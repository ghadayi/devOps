# ASP.NET Core application with Docker

This is a basic example app I made for a Medium post on how to configure Docker for a .NET Core app.

## About the example app

The sample app is a book tracker app. It let's you keep a list of your books, add new ones and delete the ones you don't have anymore.

For demo purposes only, I added an in-memory database so I don't need to configure a database. Every time you start the app the database will be reseted with some mock data.

## Prerequisites

- .NET Core SDK
- Docker

## Run

    cd SampleApp
    dotnet restore
    dotnet run

## Run with Docker

On project root folder

    # build the Docker image
    docker build -t booktracker .
    
    # Run the image on a container on port 5000
    docker run -it --rm -p 5000:80 --name booktracker_container booktracker