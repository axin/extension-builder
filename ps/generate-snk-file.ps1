param ([string]$winSdkLocation, [string]$snkFileName)

Set-Location $winSdkLocation
./sn -k "$snkFileName"
