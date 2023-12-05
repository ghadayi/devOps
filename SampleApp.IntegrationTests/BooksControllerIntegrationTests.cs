using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using Microsoft.AspNetCore.Mvc.Testing;
using SampleApp;

public class BooksControllerIntegrationTests : IClassFixture<WebApplicationFactory<Startup>>
{
    private readonly HttpClient _client;

    public BooksControllerIntegrationTests(WebApplicationFactory<Startup> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Get_Index_ReturnsAViewResult_WithAListOfBooks()
    {
        // Act
        var response = await _client.GetAsync("/Books/Index");

        // Assert
        response.EnsureSuccessStatusCode();
        var responseString = await response.Content.ReadAsStringAsync();
        // Perform assertions on the responseString that it contains elements of Books
    }
}
