using Xunit;
using OpenQA.Selenium.Chrome;

namespace SampleApp.FunctionalTests
{
    public class BooksControllerFunctionalTests
    {
        [Fact]
        public void Index_ShouldDisplayListOfBooks()
        {
            using (var driver = new ChromeDriver())
            {
                driver.Navigate().GoToUrl("http://localhost:5000/Books/Index");
                Assert.Contains("Books", driver.PageSource);
            }
        }
    }
}
