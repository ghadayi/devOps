# ASP.NET Core application with Docker

This is a basic example app I made for a Medium post on how to configure Docker for a .NET Core app.

## About the example app

The sample app is a book tracker app. It lets you keep a list of your books, add new ones, and delete the ones you don't have anymore.

For demo purposes only, I added an in-memory database so I don't need to configure a database. Every time you start the app, the database will be reset with some mock data.

## Demo Video

To see the app and the implementation in action, check out the demo video Documentation/GhadaDemo.mp4.

## Design Documentation

Detailed documentation on the pipeline design is available in the [docs directory](Documentation/pipeline-doc-design-ghada.pdf).

## Project Presentation

The PowerPoint presentation for the assesment can be viewed [here](Documentation/ghadaPresentation.pptx).

## Prerequisites

- .NET Core SDK
- Docker

## Run

To run the app, follow these steps:

```bash
cd SampleApp
dotnet restore
dotnet run
```
