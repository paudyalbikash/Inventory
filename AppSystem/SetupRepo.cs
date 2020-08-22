using AppSystem.Models;
using Helper.Utility;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Text;

namespace AppSystem
{
    public class SetupRepo : DbBase
    {
        public SetupRepo(Database db) : base(db)
        {

        }

        #region Unit
        public object GetUnit(int id)
        {
            var p = new SqlParameter[1];
            p[0] = new SqlParameter("id", id);
            return db.ExecuteDataTable(CommandType.Text, "Select * from Unit");
        }
        public object SetUnit(int? Id,string Name,int DisplayOrder)
        
        {
            var p = new SqlParameter[3];
            p[0] = new SqlParameter("@Id", Id);
            p[1] = new SqlParameter("@Name", Name);
            p[2] = new SqlParameter("@DisplayOrder", DisplayOrder);
            return db.ExecuteScalar(CommandType.StoredProcedure, "spSetUnit",p);
        } 
        public object DeleteUnit(int Id)
        {
            var p = new SqlParameter[1];
            p[0] = new SqlParameter("@Id", Id);
            return db.ExecuteScalar(CommandType.Text, "Delete Unit where Id = @Id",p);
        }
        #endregion

        #region fiscalyear
        public object Getfiscalyear(int id)
        {
            var p = new SqlParameter[1];
            p[0] = new SqlParameter("id", id);
            return db.ExecuteDataTable(CommandType.Text, "Select * from fiscalyear");
        }
        public object Setfiscalyear(int? Id, string Name, string Code, DateTime? DateFrom, DateTime? DateTo)
        
        {
            var p = new SqlParameter[5];
            p[0] = new SqlParameter("@id", Id);
            p[1] = new SqlParameter("@name", Name);
            p[2] = new SqlParameter("@code", Code);
            p[3] = new SqlParameter("@dateFrom", DateFrom);
            p[4] = new SqlParameter("@dateTo", DateTo);
            var res = db.ExecuteScalar(CommandType.StoredProcedure, "spSaveFiscalYear", p);

            return res;
        } 
        public object Deletefiscalyear(int Id)
        {
            var p = new SqlParameter[1];
            p[0] = new SqlParameter("@id", Id);
            return db.ExecuteScalar(CommandType.Text, "Update FiscalYear set Status=0 where Id=@id");
        }
        #endregion

        #region Customer
        public object GetCustomer(int id)
        {
            var p = new SqlParameter[1];
            p[0] = new SqlParameter("id", id);
            return db.ExecuteDataTable(CommandType.Text, "Select * from Customer");
        }
        public object SetCustomer(int? Id, string Name, string Address, string OpeningBlance, string Mobile, string Phone, string PanVatNumber)
        {
            var p = db.SqlParameters;
            p.AddMore("@id", Id);
            p.AddMore("@name", Name);
            p.AddMore("@address", Address);
            p.AddMore("@openingBlance", OpeningBlance);
            p.AddMore("@mobile", Mobile);
            p.AddMore("@phone", Phone);
            p.AddMore("@panVatNumber", PanVatNumber);
            return db.ExecuteScalar(CommandType.StoredProcedure, "spSetCustomer", p);
        }
        public object DeleteCustomer(int Id)
        {
            var p = new SqlParameter[1];
            p[0] = new SqlParameter("@Id", Id);
            return db.ExecuteScalar(CommandType.Text, "Delete Customer where Id = @Id",p);
        }
        #endregion

        #region Vendor
        public object GetVendor(int id)
        {
            var p = new SqlParameter[1];
            p[0] = new SqlParameter("id", id);
            return db.ExecuteDataTable(CommandType.Text, "Select * from Vendor");
        }
        public object SetVendor(int? Id, string Name, string Address, string OpeningBlance, string Mobile, string Phone, string PanVatNumber)
        {
            var p = db.SqlParameters;
            p.AddMore("@id", Id);
            p.AddMore("@name", Name);
            p.AddMore("@address", Address);
            p.AddMore("@openingBlance", OpeningBlance);
            p.AddMore("@mobile", Mobile);
            p.AddMore("@phone", Phone);
            p.AddMore("@panVatNumber", PanVatNumber);
            return db.ExecuteScalar(CommandType.StoredProcedure, "spSetVendor", p);
        }
        public object DeleteVendor(int Id)
        {
            var p = new SqlParameter[1];
            p[0] = new SqlParameter("@Id", Id);
            return db.ExecuteScalar(CommandType.Text, "Delete Vendor where Id = @Id",p);
        }
        #endregion

        #region Group
        public object GetGroup(int id)
        {
            var p = new SqlParameter[1];
            p[0] = new SqlParameter("id", id);
            return db.ExecuteDataTable(CommandType.Text, "Select * from [Group]");
        }
        public object SetGroup(int? Id, string Name, string DisplayOrder)
        {
            var p = db.SqlParameters;
            p.AddMore("@id", Id);
            p.AddMore("@name", Name);
            p.AddMore("@displayOrder", DisplayOrder);
           
            return db.ExecuteScalar(CommandType.StoredProcedure, "spSetGroup", p);
        }
        public object DeleteGroup(int Id)
        {
            var p = new SqlParameter[1];
            p[0] = new SqlParameter("@Id", Id);
            return db.ExecuteScalar(CommandType.Text, "Delete [Group] where Id = @Id", p);
        }
        #endregion

        #region Category
        public object GetCategory(int id)
        {
            var p = new SqlParameter[1];
            p[0] = new SqlParameter("id", id);
            return db.ExecuteDataTable(CommandType.Text, "Select * from Category");
        }
        public object SetCategory(int? Id, string Name, string DisplayOrder)
        {
            var p = db.SqlParameters;
            p.AddMore("@id", Id);
            p.AddMore("@name", Name);
            p.AddMore("@displayOrder", DisplayOrder);
            return db.ExecuteScalar(CommandType.StoredProcedure, "spSetCategory", p);
        }
        public object DeleteCategory(int Id)
        {
            var p = new SqlParameter[1];
            p[0] = new SqlParameter("@Id", Id);
            return db.ExecuteScalar(CommandType.Text, "Delete Category where Id = @Id", p);
        }
        #endregion
    }
}
