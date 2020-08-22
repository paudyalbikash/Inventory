using System;

namespace Helper.Utility
{
    public class FInfo
    {
        public int Id { get; set; }
        public string FileId { get; set; } = DateTime.Now.ToFileTimeUtc().ToString();
        public string Module { get; set; }
        public int DataId { get; set; }
        public int? FolderId { get; set; }
        public string FileName { get; set; }
        public long Size { get; set; }
        public string Url { get; set; }
        public string Extension { get; set; }
    }
}
