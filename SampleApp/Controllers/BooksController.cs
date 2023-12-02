using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SampleApp.Models;

namespace SampleApp.Controllers
{
    public class BooksController : Controller
    {
        private readonly AppDbContext _context;

        public BooksController(AppDbContext context) {
            _context = context;
        }

        public IActionResult Index()
        {
            ViewBag.Books = _context.Books;
            
            return View();
        }

        public IActionResult AddOrEdit(string id)
        {   
            if(string.IsNullOrEmpty(id)) {
                return View(new Book());
            }
            
            return View(_context.Books.Find(id));
        }

        [HttpPost]
        public IActionResult AddOrEdit([Bind("Id, Name")] Book book)
        {
            if (ModelState.IsValid)
            {
                if(string.IsNullOrEmpty(book.Id)) {
                    _context.Books.Add(book);
                } else {
                    _context.Books.Update(book);
                }

                _context.SaveChanges();
                return RedirectToAction("Index");
            }

            return View(book);
        }

        public IActionResult Delete(string id)
        {
            var book = _context.Books.First(b => b.Id == id);

            _context.Books.Remove(book);
            _context.SaveChanges();
            
            return RedirectToAction("Index");
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
