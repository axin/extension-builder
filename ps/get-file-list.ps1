# Writes to standard output list of files in given <directory> and its subdirectories

param ([string]$directory)

function checkArguments {
    if ($directory -Eq "") {
        $directory = "."
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
