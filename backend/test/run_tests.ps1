# Run Google Sheets tests (avoids broken global pytest plugins on some machines)
$env:PYTEST_DISABLE_PLUGIN_AUTOLOAD = "1"
Set-Location $PSScriptRoot\..
python -m pytest test/ -v @args
