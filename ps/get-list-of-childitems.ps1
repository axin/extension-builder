# Writes to standard output list of files and subdirectories in given <directory>.

param ([string]$directory, [string]$onlyFiles)

function exitWithError {
    param ($message)

    Write-Error $message
    exit 1
}

function checkArguments {
    if ($directory -Eq "") {
        $directory = "."
    }

    if (-Not (Test-Path $directory)) {
        exitWithError("Directory does not exist")
    }
}

function getListOfChilditems {
    $result = '[';

    $items = Get-Childitem -Recurse

    if ($items.Length -eq 0) {
        $result = '[]'
    } else {
        $items | foreach {
            if ($onlyFiles -Eq "true") {
                if (-Not $_.PSIsContainer) {
                    $result += ('"' + ($_.FullName -Replace '\\', '\\') + '"' + ', ')
                }
            } else {
                $result += ('"' + ($_.FullName -Replace '\\', '\\') + '"' + ', ')
            }
        }

        $result = $result -replace ', $', ']'
    }

    return $result
}

function echoListOfChilditems {
    $listOfChilditems = getListOfChilditems
    Write-Host $listOfChilditems
}

checkArguments

Push-Location $directory

echoListOfChilditems

Pop-Location
