gacutil /if "bin\{{{extensionName}}}Bho.dll"
regasm "bin\{{{extensionName}}}Bho.dll"
gacutil /if "bin\Interop.SHDocVw.dll"
