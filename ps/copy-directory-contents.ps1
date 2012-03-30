# Copies contents of <source> to <destination>

param ([string]$source, [string]$destination)

function exitWithError {
    param ($message)

    Write-Error $message
    exit 1
}

function checkArguments {
    if ($source -Eq "") {
        exitWithError("Source required")
    }

    if ($destination -Eq "") {
        exitWithError("Destination required")
    }
}

function createDestinationDirectoryIfNotExists {
    if (-Not (Test-Path -Path $destination)) {
        New-Item -Path $destination -ItemType "directory"
    }
}

function copyItems {
    $SourceContent = Get-Childitem $source

    $SourceContent | Foreach {
        Copy-Item -Path $_.FullName -Destination $destination -Force -Recurse
    }
}

checkArguments
createDestinationDirectoryIfNotExists
copyItems
