using System.Collections.Generic;

namespace Helper.Utility
{
    public static class UtilityExtension
    {
        public static bool IsValidMobileNo(this string value)
        {
            return (!string.IsNullOrEmpty(value) && value.StartsWith("9") && value.Length == 10);
        }

        public static string TransformToString(this List<int> values)
        {
            var val = string.Join(",", values);
            return val;
        }

        public static string TransformToString(this int[] values)
        {
            var val = string.Join(",", values);
            return val;
        }

        public static string TransformToString(this List<string> values)
        {
            var val = string.Join(",", values);
            return val;
        }

        public static string RepeateString(this string s, int times)
        {
            string value = string.Empty;
            for (int i = 0; i < times; i++)
            {
                value += s;
            }
            return value;
        }

        public static bool IsImageFile(this string extension)
        {
            extension = extension.ToLower();
            return extension.Contains("jpg") || extension.Contains("jpeg") || extension.Contains("png") || extension.Contains("gif");
        }
    }
}
