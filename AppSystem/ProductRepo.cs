using AppSystem.Models;
using Helper.Utility;
using System;
using System.Collections.Generic;
using System.Data;
using System.Text;

namespace AppSystem
{
    public class ProductRepo:DbBase
    {
        public ProductRepo(Database db) : base(db)
        {

        }

        public object GetProduct(int? Id)
        {
            var p = db.SqlParameters;
            p.AddMore("@id", Id);
            return db.ExecuteDataTable(CommandType.StoredProcedure, "spGetProduct", p);
        }
    }
}
