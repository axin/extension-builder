param ([string]$monoBinDir, [string]$snkFileName)

Set-Location $monoBinDir
./sn -k "$snkFileName"
