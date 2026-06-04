# Run backend unit tests (avoids broken global pytest plugins on some machines)
$env:PYTEST_DISABLE_PLUGIN_AUTOLOAD = "1"
Set-Location $PSScriptRoot\..
python -m pytest test/test_tools.py test/test_agent_intake.py -q
