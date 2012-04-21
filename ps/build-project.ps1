param ([string]$msbuildLocation, [string]$projectFile)

Set-Location $msbuildLocation
./msbuild /p:configuration=release "$projectFile"
