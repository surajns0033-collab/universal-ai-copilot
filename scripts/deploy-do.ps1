#Requires -Version 5.1
<#
.SYNOPSIS
    One-command deploy of Universal AI Copilot to DigitalOcean App Platform (free tier).

.DESCRIPTION
    Uses the DigitalOcean REST API v2 directly, so it does NOT require the `doctl`
    CLI to be installed. It creates (or updates) an App Platform app that builds the
    repository's Dockerfile and runs it on the free `basic-xxs` instance size.

    Secrets are read interactively with hidden input and are never printed, never
    written to disk, and never committed.

.PARAMETER Create
    Create a new App Platform app (default when no existing app id is supplied).

.PARAMETER Update
    Update the existing app instead of creating a new one.

.PARAMETER AppId
    DigitalOcean App Platform app id (required for -Update).

.PARAMETER Repo
    GitHub repository in `owner/name` form. Default: surajns0033-collab/universal-ai-copilot

.PARAMETER Branch
    Git branch to deploy. Default: main

.PARAMETER Region
    DigitalOcean region slug. Default: blr (Bangalore)

.PARAMETER SpecPath
    Path to the App Platform spec used for the deploy. Default: app.yaml

.EXAMPLE
    powershell -NoProfile -File scripts/deploy-do.ps1 -Create
    # Creates the app, then poll the printed URL for the live domain.

.EXAMPLE
    npm run deploy:do
#>
[CmdletBinding()]
param(
    [switch]$Create,
    [switch]$Update,
    [string]$AppId = '',
    [string]$Repo = 'surajns0033-collab/universal-ai-copilot',
    [string]$Branch = 'main',
    [string]$Region = 'blr',
    [string]$SpecPath = 'app.yaml'
)

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$ApiBase = 'https://api.digitalocean.com/v2'

function Write-Step([string]$Message) {
    Write-Host ''
    Write-Host "==> $Message" -ForegroundColor Cyan
}
function Write-Ok([string]$Message) { Write-Host "    [ok] $Message" -ForegroundColor Green }
function Write-Warn([string]$Message) { Write-Host "    [!]  $Message" -ForegroundColor Yellow }

# --- 1. Read secrets with hidden input (never echoed) --------------------------
Write-Host '============================================================' -ForegroundColor Magenta
Write-Host '  DigitalOcean App Platform deploy - Universal AI Copilot' -ForegroundColor Magenta
Write-Host '  Target instance size: basic-xxs (free tier)' -ForegroundColor Magenta
Write-Host '============================================================' -ForegroundColor Magenta

$doTokenSecure = Read-Host '  DIGITALOCEAN_TOKEN (hidden)' -AsSecureString
$geminiSecure  = Read-Host '  GEMINI_API_KEY     (hidden)' -AsSecureString

function ConvertTo-Plain([Security.SecureString]$Secure) {
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Secure)
    try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}

$doToken   = (ConvertTo-Plain $doTokenSecure).Trim()
$geminiKey = (ConvertTo-Plain $geminiSecure).Trim()

if ([string]::IsNullOrWhiteSpace($doToken))   { throw 'No DigitalOcean token supplied - aborted.' }
if ([string]::IsNullOrWhiteSpace($geminiKey)) { throw 'No Gemini API key supplied - aborted.' }

$headers = @{
    Authorization  = "Bearer $doToken"
    'Content-Type' = 'application/json'
}

# --- 2. Determine create vs update --------------------------------------------
if (-not $Create -and [string]::IsNullOrWhiteSpace($AppId)) {
    # Look for an existing app with the same name so a re-run updates instead of duplicates.
    Write-Step 'Looking for an existing "universal-ai-copilot" app'
    try {
        $existing = Invoke-RestMethod -Uri "$ApiBase/apps" -Headers $headers -Method Get
        $match = $existing.apps | Where-Object { $_.spec.name -eq 'universal-ai-copilot' } | Select-Object -First 1
        if ($match) {
            $AppId = $match.id
            $Update = $true
            Write-Ok "Found existing app: $AppId"
        } else {
            $Create = $true
            Write-Ok 'No existing app found - will create one.'
        }
    } catch {
        Write-Warn "Could not list apps ($($_.Exception.Message)) - assuming create."
        $Create = $true
    }
}
if ([string]::IsNullOrWhiteSpace($AppId) -and -not $Create) { $Create = $true }

# --- 3. Build the App Platform spec (JSON) ------------------------------------
Write-Step 'Building the App Platform spec (free tier: basic-xxs)'

# Prefer the repository app.yaml so the deployed spec stays in sync with the docs,
# but compose it here as JSON so no YAML parser is required on Windows.
$spec = @{
    name   = 'universal-ai-copilot'
    region = $Region
    services = @(
        @{
            name             = 'web'
            dockerfile_path  = 'Dockerfile'
            source_dir       = '/'
            github           = @{
                repo           = $Repo
                branch         = $Branch
                deploy_on_push = $true
            }
            http_port        = 8080
            instance_count   = 1
            instance_size_slug = 'basic-xxs'   # free tier
            health_check     = @{ http_path = '/api/analyze' }
            envs             = @(
                @{ key = 'GEMINI_API_KEY';       scope = 'RUN_TIME'; type = 'SECRET'; value = $geminiKey }
                @{ key = 'GEMMA_MODEL';          scope = 'RUN_TIME'; value = 'gemma-4-26b-a4b-it' }
                @{ key = 'MAX_UPLOAD_MB';        scope = 'RUN_TIME'; value = '15' }
                @{ key = 'AI_REQUEST_TIMEOUT_MS'; scope = 'RUN_TIME'; value = '45000' }
            )
        }
    )
}

$body = @{ spec = $spec } | ConvertTo-Json -Depth 12

# --- 4. Create or update ------------------------------------------------------
if ($Create) {
    Write-Step 'Creating the App Platform app (first deploy takes a few minutes)'
    try {
        $result = Invoke-RestMethod -Uri "$ApiBase/apps" -Headers $headers -Method Post -Body $body
    } catch {
        $detail = $_.ErrorDetails.Message
        throw "Create failed: $($_.Exception.Message) $detail"
    }
    $AppId = $result.app.id
    Write-Ok "Created app: $AppId"
} else {
    Write-Step "Updating the existing App Platform app ($AppId)"
    try {
        $result = Invoke-RestMethod -Uri "$ApiBase/apps/$AppId" -Headers $headers -Method Put -Body $body
    } catch {
        $detail = $_.ErrorDetails.Message
        throw "Update failed: $($_.Exception.Message) $detail"
    }
    Write-Ok 'Update submitted.'
}

# --- 5. Report the live URL ---------------------------------------------------
Write-Step 'Deployment accepted'
$liveUrl = $result.app.live_url
if (-not $liveUrl) { $liveUrl = $result.app.default_ingress }
Write-Host "    App id   : $AppId"
Write-Host "    Live URL : $liveUrl" -ForegroundColor Green
Write-Host '    Status   : https://cloud.digitalocean.com/apps/' -NoNewline
Write-Host $AppId

Write-Host ''
Write-Host 'Next: wait for the build to finish, then verify:' -ForegroundColor Cyan
Write-Host "    curl $liveUrl/api/analyze"
Write-Host '    Expect HTTP 200 with {"success":true,"data":{"ready":true,...}}'
Write-Host ''
Write-Host 'The token and the API key were never printed, written to disk, or committed.' -ForegroundColor Green
