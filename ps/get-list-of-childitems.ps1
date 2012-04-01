# Writes to standard output list of files or subdirectories in given <directory>.
# <childitems> parameter can be "files" or "directories"

param ([string]$directory, [string]$childitems)

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

    if ($childitems -Eq "") {
        exitWithError("Childitems parameter should be specified")
    } elseif (($childitems -Ne "files") -And ($childitems -Ne "directories")) {
        exitWithError("Childitems parameter should be equal to 'files' or 'directories'")
    }
}

function getListOfChilditems {
    $result = '[';

    if ($childitems -Eq "files") {
        $items = Get-Childitem -Recurse *
    } else {
        $items = Get-Childitem -Recurse
    }

    if ($items.Length -eq 0) {
        $result = '[]'
    } else {
        $items | foreach {
            if ((($childitems -Eq "files") -And (-Not $_.PSIsContainer)) -Or
                (($childitems -Eq "directories") -And $_.PSIsContainer)) {
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
