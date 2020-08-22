using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using AppSystem;
using Microsoft.AspNetCore.Mvc;

namespace Inventory.Controllers
{
    public class ProductController : Controller
    {
        private readonly ProductRepo ProductRepo;

        public ProductController(ProductRepo _ProductRepo)
        {
            ProductRepo = _ProductRepo;
        }
        public IActionResult GetProduct(int? Id)
        {
            return Ok(ProductRepo.GetProduct(Id));
        }
    }
}