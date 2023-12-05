using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using Microsoft.AspNetCore.Mvc.Testing;
using SampleApp;

public class BooksControllerIntegrationTests : IClassFixture<WebApplicationFactory<Startup>>
{
    private readonly HttpClient _client;

    public BooksControllerIntegrationTests(WebApplicationFactory<SampleApp.Startup> factory)
    {
        // Create a client with a specific base address
        _client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("http://34.124.220.35:80/")
        });
    }

    public async Task Get_Index_ReturnsAViewResult_WithAListOfBooks()
    {
        // Act
        var response = await _client.GetAsync("Books/Index");

        // Assert
        response.EnsureSuccessStatusCode();
        var responseString = await response.Content.ReadAsStringAsync();
        // Perform assertions on the responseString that it contains elements of Books
    }
}
