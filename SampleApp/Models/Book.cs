using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SampleApp.Models
{
    
    public class Book
    {
        public string Id { get; set; }

        [Required(ErrorMessage ="Name is required")]
        public string Name { get; set; }
    }
}