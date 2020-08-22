using System;

namespace Helper.Utility
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Property | AttributeTargets.Field, AllowMultiple = false)]
    public class TitleCaseAttribute : Attribute
    {

    }

    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Property | AttributeTargets.Field, AllowMultiple = false)]
    public class SentenceCaseAttribute : Attribute
    {

    }

    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Property | AttributeTargets.Field, AllowMultiple = false)]
    public class LowerCaseAttribute : Attribute
    {

    }

    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Property | AttributeTargets.Field, AllowMultiple = false)]
    public class UpperCaseAttribute : Attribute
    {

    }

    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Property | AttributeTargets.Field, AllowMultiple = false)]
    public class IncludeWhitespaceAttribute : Attribute
    {

    }
}
