# Writes to standard output list of files in given <directory> and its subdirectories

param ([string]$directory)

function exitWithError {
    param ($message)

    Write-Error $message
    exit 1
}

function checkArguments {
    if ($directory -Eq "") {
        $directory = "."
    }

    if (-not (Test-Path $directory)) {
        exitWithError("Directory does not exist")
    }
}

function getFileList {
    $result = '[';
    $files = Get-Childitem -Recurse *

    $files | foreach {
        if (-not $_.PSIsContainer) {
            $result += ('"' + ($_.FullName -Replace '\\', '\\') + '"' + ', ')
        }
    }

    $result = $result -replace ', $', ']'

    return $result
}

function echoFileList {
    $fileList = getFileList
    Write-Host $fileList
}

checkArguments

Push-Location $directory

echoFileList

Pop-Location
