using Xunit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SampleApp.Models;
using SampleApp.Controllers;
using System.Collections.Generic;
using System.Linq;

namespace SampleApp.UnitTests
{
    public class BooksControllerTests
    {
        [Fact]
        public void Index_ReturnsAViewResult_WithAListOfBooks()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb")
                .Options;

            using (var context = new AppDbContext(options))
            {
                context.Books.Add(new Book { Id = "9", Name = "Book1" });
                context.Books.Add(new Book { Id = "10", Name = "Book2" });
                context.SaveChanges();
            }

            using (var context = new AppDbContext(options))
            {
                var controller = new BooksController(context);

                // Act
                var result = controller.Index();

                // Assert
                var viewResult = Assert.IsType<ViewResult>(result);
                var books = controller.ViewBag.Books as IEnumerable<Book>;
                Assert.NotNull(books);
                Assert.Equal(2, books.Count());
            }
        }

    }
}
