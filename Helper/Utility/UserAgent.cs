using Microsoft.AspNetCore.Http;

namespace Helper.Utility
{
    public static class UserAgent
    {
        public static string ClientIpAddress
        {
            get
            {
                var context = DI.Instance.Resolve<IHttpContextAccessor>().HttpContext;

                string ipAddress = context.Connection.RemoteIpAddress.ToString();
                return ipAddress;
            }
        }

        public static string ClientUserAgent
        {
            get
            {
                var context = DI.Instance.Resolve<IHttpContextAccessor>().HttpContext;
                return context.Request.Headers["User-Agent"].ToString();

            }
        }

        public static string ClientDevice
        {
            get
            {
                //var context = DI.Instance.Resolve<IHttpContextAccessor>().HttpContext;
                return string.Empty;

                //HttpRequest currentRequest = HttpContext.Current.Request;
                //string userAgent = currentRequest != null ? currentRequest.ServerVariables["REMOTE_HOST"] : "NA";

                //return userAgent;
            }
        }
    }
}
