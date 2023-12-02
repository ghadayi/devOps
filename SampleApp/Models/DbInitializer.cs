namespace SampleApp.Models
{
    public class DbInitializer
    {
        public static void Initialize(AppDbContext context)
        {
            context.Database.EnsureCreated();

            var books = new Book[]
            {
                new Book{ Name = "The Fellowship of the Ring (The Lord of the Rings, #1)" },
                new Book{ Name = "The Two Towers" },
                new Book{ Name = "Shout" },
                new Book{ Name = "Frankly in Love" },
            };
            
            context.Books.AddRange(books);

            context.SaveChanges();
        }
    }
}