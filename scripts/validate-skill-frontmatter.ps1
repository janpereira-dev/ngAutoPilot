param(
    [string[]]$Roots
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$pythonScript = Join-Path $scriptDir 'validate-skill-frontmatter.py'

if (-not (Test-Path -LiteralPath $pythonScript)) {
    throw "No se encontró el validador Python en: $pythonScript"
}

$python = $null
foreach ($candidate in @('python', 'py')) {
    $cmd = Get-Command $candidate -ErrorAction SilentlyContinue
    if ($cmd) {
        $python = $cmd.Source
        break
    }
}

if (-not $python) {
    throw "No encontré Python en PATH. Instalá Python o ajustá el wrapper."
}

$argsList = @($pythonScript)
if ($Roots) {
    $argsList += $Roots
}

& $python @argsList
exit $LASTEXITCODE
