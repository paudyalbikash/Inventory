using Microsoft.Extensions.Configuration;

namespace Helper
{
        public class AppConfig
        {
            private readonly IConfiguration _config;
            public AppConfig(IConfiguration config)
            {
                _config = config;
            }

            public string GetConnectionstring(string name)
            {
                return ConfigurationExtensions.GetConnectionString(_config, name);
            }

            public string GetValue(string key)
            {
                return _config.GetSection(key).Value;
            }
        }
    }
