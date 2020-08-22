namespace Helper
{
    public class DbResponse
    {
        public string Message { get; set; }
        public bool HasError { get; set; }
        public object Response { get; set; }
        public string Key { get; set; }
    }
}
