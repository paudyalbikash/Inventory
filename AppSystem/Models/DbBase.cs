using System;
using System.Collections.Generic;
using System.Text;

namespace AppSystem.Models
{
    public class DbBase
    {
        protected Database db;
        public DbBase(Database database)
        {
            db = database;
        }
    }
}
