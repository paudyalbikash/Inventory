using Microsoft.Extensions.DependencyInjection;

namespace Helper
{
   public class DI
    {
        private readonly IServiceCollection _serviceCollection;
        public DI(IServiceCollection serviceCollection)
        {
            _serviceCollection = serviceCollection;
        }

        private static DI _instance;
        public static DI Instance
        {
            get
            {
                return _instance;
            }
        }

        public static void Initialize(IServiceCollection serviceCollection)
        {
            _instance = new DI(serviceCollection);
        }

        public ServiceProvider Resolver
        {
            get
            {
                return _serviceCollection.BuildServiceProvider();
            }
        }

        public T Resolve<T>()
        {
            return Resolver.GetService<T>();
        }
    }
}
