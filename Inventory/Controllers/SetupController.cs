using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AppSystem;
using Microsoft.AspNetCore.Mvc;

namespace Inventory.Controllers
{
    public class SetupController : Controller
    {
        private readonly SetupRepo setupRepo;

        public SetupController(SetupRepo _setupRepo)
        {
            setupRepo = _setupRepo;
        }

        #region Unit

        public IActionResult GetUnit(int id)
        {
            return Ok(setupRepo.GetUnit(id));
        }

        [HttpPost]
        public IActionResult SetUnit(int? Id, string Name, int DisplayOrder)
        {
            return Ok(setupRepo.SetUnit(Id, Name, DisplayOrder));
        }

        public IActionResult DeleteUnit(int Id)
        {
            return Ok(setupRepo.DeleteUnit(Id));
        }

        #endregion
        
        #region FiscalYear

        public IActionResult Getfiscalyear(int id)
        {
            return Ok(setupRepo.Getfiscalyear(id));
        }

        [HttpPost]
        public IActionResult SetFiscalyear(int? Id, string Name, string Code,DateTime DateFrom,DateTime DateTo)
        {
            return Ok(setupRepo.Setfiscalyear(Id, Name,Code, DateFrom,DateTo));
        }

        public IActionResult Deletefiscalyear(int Id)
        {
            return Ok(setupRepo.Deletefiscalyear(Id));
        }

        #endregion

        #region Customer
        public IActionResult GetCustomer(int id)
        {
            return Ok(setupRepo.GetCustomer(id));
        }

        [HttpPost]
        public IActionResult SetCustomer(int? Id, string Name, string Address,string OpeningBlance,string Mobile,string Phone,string PanVatNumber)
        {
            return Ok(setupRepo.SetCustomer(Id, Name,Address,OpeningBlance,Mobile,Phone,PanVatNumber));
        }

        public IActionResult DeleteCustomer(int Id)
        {
            return Ok(setupRepo.DeleteCustomer(Id));
        }

        #endregion

        #region Vendor
        public IActionResult GetVendor(int id)
        {
            return Ok(setupRepo.GetVendor(id));
        }

        [HttpPost]
        public IActionResult SetVendor(int? Id, string Name, string Address, string OpeningBlance, string Mobile, string Phone, string PanVatNumber)
        {
            return Ok(setupRepo.SetVendor(Id, Name, Address, OpeningBlance, Mobile, Phone, PanVatNumber));
        }

        public IActionResult DeleteVendor(int Id)
        {
            return Ok(setupRepo.DeleteVendor(Id));
        }

        #endregion

        #region Group
        public IActionResult GetGroup(int id)
        {
            return Ok(setupRepo.GetGroup(id));
        }

        [HttpPost]
        public IActionResult SetGroup(int? Id, string Name, string DisplayOrder)
        {
            return Ok(setupRepo.SetGroup(Id, Name, DisplayOrder));
        }

        public IActionResult DeleteGroup(int Id)
        {
            return Ok(setupRepo.DeleteGroup(Id));
        }

        #endregion

        #region Category
        public IActionResult GetCategory(int id)
        {
            return Ok(setupRepo.GetCategory(id));
        }

        [HttpPost]
        public IActionResult SetCategory(int? Id, string Name, string DisplayOrder)
        {
            return Ok(setupRepo.SetCategory(Id, Name, DisplayOrder));
        }

        public IActionResult DeleteCategory(int Id)
        {
            return Ok(setupRepo.DeleteCategory(Id));
        }

        #endregion
    }
}