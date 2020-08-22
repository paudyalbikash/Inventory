using Helper;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;

namespace AppSystem.Models
{
    public class Database
    {
        private readonly AppConfig _config;

        public List<SqlParameter> SqlParameters
        {
            get
            {
                return new List<SqlParameter>();
            }
        }
        public Database(AppConfig config)
        {
            _config = config;
            this.ConnectionString = _config.GetConnectionstring("DbConnection");
        }

        private string ConnectionString { get; set; }

        public DataSet ExecuteDataSet(CommandType cmdType, string cmdString, IEnumerable<SqlParameter> sqlParameters = null)
        {
            var cn = new SqlConnection(this.ConnectionString);
            var cmd = new SqlCommand();
            var da = new SqlDataAdapter(cmd);
            DataSet ds = new DataSet();

            cmd.CommandType = cmdType;
            cmd.CommandText = cmdString;
            if (sqlParameters != null)
            {
                cmd.Parameters.AddRange(sqlParameters.ToArray());
            }

            cmd.Connection = cn;
            da.Fill(ds);
            cmd.Parameters.Clear();
            cn.Dispose();
            return ds;
        }

        public DataTable ExecuteDataTable(CommandType cmdType, string cmdString, IEnumerable<SqlParameter> sqlParameters = null)
        {
            var ds = this.ExecuteDataSet(cmdType, cmdString, sqlParameters);
            return ds.Tables[0];
        }

        public DbResponse ExecuteTransaction(CommandType cmdType, string cmdString, IEnumerable<SqlParameter> sqlParameters = null)
        {
            var ds = this.ExecuteDataSet(cmdType, cmdString, sqlParameters);
            if (ds.Tables.Count == 0 || ds.Tables[0].Rows.Count == 0)
                return new DbResponse
                {
                    HasError = true,
                    Message = "No response"
                };
            var dr = ds.Tables[0].Rows[0];
            if (dr.Field<string>("Key") == "Error")
            {
                return new DbResponse
                {
                    HasError = true,
                    Message = dr.Field<string>("Value"),
                };
            }
            else
            {
                return new DbResponse
                {
                    Response = dr["Value"]
                };
            }
        }

        public DbResponse ExecuteScalar(CommandType cmdType, string cmdString, IEnumerable<SqlParameter> sqlParameters = null)
        {
            try
            {
                SqlConnection cn = new SqlConnection(this.ConnectionString);
                SqlCommand cmd = new SqlCommand
                {
                    CommandType = cmdType,
                    CommandText = cmdString
                };

                if (sqlParameters != null)
                {
                    cmd.Parameters.AddRange(sqlParameters.ToArray());
                }

                cmd.Connection = cn;

                if (cn.State != ConnectionState.Open)
                {
                    cn.Open();
                }

                object result = cmd.ExecuteScalar();
                cmd.Parameters.Clear();
                cn.Close();
                cn.Dispose();
                return new DbResponse() { Response = result };
            }
            catch (SqlException ex)
            {
                return new DbResponse
                {
                    Message = ex.Message,
                    HasError = true
                };
            }
        }

        public DbResponse ExecuteNonQuery(CommandType cmdType, string cmdString, IEnumerable<SqlParameter> sqlParameters = null)
        {
            SqlConnection cn = new SqlConnection(this.ConnectionString);
            SqlCommand cmd = new SqlCommand
            {
                CommandType = cmdType,
                CommandText = cmdString
            };
            if (sqlParameters != null)
            {
                cmd.Parameters.AddRange(sqlParameters.ToArray());
            }

            cmd.Connection = cn;
            int response = 0;
            cn.Open();
            try
            {
                response = cmd.ExecuteNonQuery();
                cmd.Parameters.Clear();
                return new DbResponse() { Message = "success" };
            }
            catch (SqlException ex)
            {
                return new DbResponse
                {
                    HasError = true,
                    Message = ex.Message,
                    Response = response
                };
            }
            finally
            {
                if (cn.State == ConnectionState.Open)
                {
                    cn.Close();
                }
                cn.Dispose();
            }
        }
    }
}
