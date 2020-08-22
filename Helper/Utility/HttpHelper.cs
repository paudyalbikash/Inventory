using Microsoft.AspNetCore.Hosting;

namespace Helper.Utility
{
    public class HttpHelper
    {
        public static string ServerPath
        {
            get
            {
                var env = DI.Instance.Resolve<IHostingEnvironment>();
                return env.WebRootPath;
            }
        }

    }
}
