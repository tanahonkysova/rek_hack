<#
.SYNOPSIS
  Pošle e-maily reklamací (*.eml) do sdílené schránky reklamace@, aby je zpracoval flow F1.

.DESCRIPTION
  Každý .eml (UTF-8, hlavičky From, To, Subject, tělo, příloha base64) se rozebere a pošle
  přes Microsoft Graph (sendMail) pod přihlášeným účtem. Zachová se předmět, tělo a všechny přílohy.

  F1 předává AI předmět, odesílatele a tělo a podle e-mailu zákazníka hledá objednávku.
  Odeslat e-mail pod cizí adresou nejde, proto skript vloží na začátek těla řádek
  „Původní odesílatel: Jméno <adresa>“ a adresu dá i do Reply-To. AI prompt F1 tak
  e-mail zákazníka najde v textu (u formuláře e-shopu je e-mail zákazníka v textu formuláře).

  Přihlášení: kód zařízení (Microsoft Graph Command Line Tools, oprávnění Mail.Send).
  Při prvním spuštění skript vypíše kód a adresu, kde se přihlásíte lab účtem. Obnovovací
  token se uloží šifrovaně (DPAPI, jen pro váš účet Windows) do %LOCALAPPDATA%\posli-emaily.

.EXAMPLE
  .\starter-kit\posli-emaily.ps1 -Komu reklamace@firma.onmicrosoft.com
  Pošle všechny e-maily z data/vstupy/.

.EXAMPLE
  .\starter-kit\posli-emaily.ps1 -Komu reklamace@firma.onmicrosoft.com -Emaily E-01,E-03

.EXAMPLE
  .\starter-kit\posli-emaily.ps1 -Emaily E-01 -WhatIf
  Jen ukáže, co by poslal (bez přihlášení).

.EXAMPLE
  .\starter-kit\posli-emaily.ps1 -Test
  Pošle jeden testovací e-mail s přílohou na přihlášený účet.
#>
[CmdletBinding(SupportsShouldProcess = $true)]
param(
    # Složka s .eml soubory. Výchozí data/vstupy/ v kořeni projektu.
    [string]$Slozka = (Join-Path (Split-Path $PSScriptRoot -Parent) 'data\vstupy'),

    # Které e-maily poslat, např. -Emaily E-01,E-03. Bez parametru všechny *.eml ve složce.
    [string[]]$Emaily,

    # Adresa sdílené schránky reklamace@ z portálu. Výchozí z proměnné prostředí REKLAMACE_SCHRANKA.
    [string]$Komu = $env:REKLAMACE_SCHRANKA,

    # Tenant pro přihlášení (doména nebo GUID).
    [string]$Tenant = 'organizations',

    # Nevkládat do těla řádek s původním odesílatelem.
    [switch]$BezPuvodnihoOdesilatele,

    # Pauza mezi e-maily v sekundách (aby F1 zpracoval e-maily v pořadí).
    [int]$Pauza = 3,

    # Poslat jeden testovací e-mail s přílohou na přihlášený účet a skončit.
    [switch]$Test,

    # Smazat uložené přihlášení a přihlásit se znovu.
    [switch]$Odhlasit
)

$ErrorActionPreference = 'Stop'
$ClientId = '14d82eec-204b-4c2f-b7e8-296a70dab67e'   # Microsoft Graph Command Line Tools (veřejný klient)
$Scope = 'https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/User.Read offline_access'
$CacheDir = Join-Path $env:LOCALAPPDATA 'posli-emaily'
$CacheFile = Join-Path $CacheDir 'token.dat'
$Latin1 = [Text.Encoding]::GetEncoding(28591)

# ---------- MIME ----------

function ConvertFrom-EncodedWord([string]$s) {
    if (-not $s) { return $s }
    $s = [regex]::Replace($s, '(\?=)\s+(=\?)', '$1$2')
    [regex]::Replace($s, '=\?([^?]+)\?([BbQq])\?([^?]*)\?=', {
        param($m)
        $enc = try { [Text.Encoding]::GetEncoding($m.Groups[1].Value) } catch { [Text.Encoding]::UTF8 }
        if ($m.Groups[2].Value -in 'B', 'b') { $bytes = [Convert]::FromBase64String($m.Groups[3].Value) }
        else { $bytes = ConvertFrom-QuotedPrintable ($m.Groups[3].Value -replace '_', ' ') }
        $enc.GetString($bytes)
    })
}

function ConvertFrom-QuotedPrintable([string]$s) {
    $s = [regex]::Replace($s, '=\r?\n', '')
    $out = New-Object System.Collections.Generic.List[byte]
    for ($i = 0; $i -lt $s.Length; $i++) {
        if ($s[$i] -eq '=' -and $i + 2 -lt $s.Length -and $s.Substring($i + 1, 2) -match '^[0-9A-Fa-f]{2}$') {
            $out.Add([Convert]::ToByte($s.Substring($i + 1, 2), 16)); $i += 2
        } else { $out.Add([byte]([int][char]$s[$i] -band 0xFF)) }
    }
    , $out.ToArray()
}

function Split-Headers([string]$raw) {
    $m = [regex]::Match($raw, '\r?\n\r?\n')
    if ($m.Success) { $head = $raw.Substring(0, $m.Index); $body = $raw.Substring($m.Index + $m.Length) }
    else { $head = $raw; $body = '' }
    $h = @{}
    foreach ($line in ([regex]::Replace($head, '\r?\n[ \t]+', ' ') -split '\r?\n')) {
        if ($line -match '^([^:\s]+):\s*(.*)$') {
            $k = $Matches[1].ToLowerInvariant(); if (-not $h.ContainsKey($k)) { $h[$k] = $Matches[2].Trim() }
        }
    }
    @{ Headers = $h; Body = $body }
}

function Get-HeaderParam([string]$value, [string]$name) {
    if ($value -match "(?i)(?:^|;)\s*$name\*?=\s*(?:`"([^`"]*)`"|([^;\s]+))") {
        $v = if ($Matches[1]) { $Matches[1] } else { $Matches[2] }
        if ($v -match "^(?i)utf-8''(.+)$") { $v = [Uri]::UnescapeDataString($Matches[1]) }
        return (ConvertFrom-EncodedWord $v)
    }
    $null
}

function Read-MimePart([string]$raw, $result) {
    $p = Split-Headers $raw
    $ct = if ($p.Headers['content-type']) { $p.Headers['content-type'] } else { 'text/plain; charset=utf-8' }
    $type = ($ct -split ';')[0].Trim().ToLowerInvariant()
    if ($type -like 'multipart/*') {
        $b = Get-HeaderParam $ct 'boundary'
        $parts = $p.Body -split ('(?m)^--' + [regex]::Escape($b) + '(?:--)?[ \t]*\r?$')
        for ($i = 1; $i -lt $parts.Count; $i++) {
            $part = $parts[$i] -replace '^\r?\n', ''
            if ($part.Trim()) { Read-MimePart $part $result }
        }
        return
    }
    $cte = "$($p.Headers['content-transfer-encoding'])".ToLowerInvariant()
    $bytes = switch ($cte) {
        'base64' { [Convert]::FromBase64String(($p.Body -replace '\s', '')) }
        'quoted-printable' { ConvertFrom-QuotedPrintable $p.Body }
        default { $Latin1.GetBytes(($p.Body -replace '\r?\n$', '')) }
    }
    $cd = "$($p.Headers['content-disposition'])"
    $fname = Get-HeaderParam $cd 'filename'; if (-not $fname) { $fname = Get-HeaderParam $ct 'name' }
    $isAttachment = $cd -match '^(?i)attachment' -or ($fname -and $type -notlike 'text/*') -or ($type -notlike 'text/*')
    if ($isAttachment) {
        if (-not $fname) { $fname = 'priloha' + $result.Attachments.Count + '.' + ($type -split '/')[1] }
        [void]$result.Attachments.Add(@{ Name = $fname; ContentType = $type; Bytes = $bytes })
    } else {
        $cs = Get-HeaderParam $ct 'charset'; if (-not $cs) { $cs = 'utf-8' }
        $enc = try { [Text.Encoding]::GetEncoding($cs) } catch { [Text.Encoding]::UTF8 }
        $text = $enc.GetString($bytes)
        if ($type -eq 'text/plain' -and $null -eq $result.Text) { $result.Text = $text }
        elseif ($type -eq 'text/html' -and $null -eq $result.Html) { $result.Html = $text }
    }
}

function Read-Eml([string]$path) {
    $raw = $Latin1.GetString([IO.File]::ReadAllBytes($path))
    $top = Split-Headers $raw
    $result = @{ Text = $null; Html = $null; Attachments = (New-Object System.Collections.ArrayList) }
    Read-MimePart $raw $result
    $from = ConvertFrom-EncodedWord ([Text.Encoding]::UTF8.GetString($Latin1.GetBytes("$($top.Headers['from'])")))
    $subject = ConvertFrom-EncodedWord ([Text.Encoding]::UTF8.GetString($Latin1.GetBytes("$($top.Headers['subject'])")))
    $addr = if ($from -match '<([^>]+)>') { $Matches[1] } elseif ($from -match '[^\s<>]+@[^\s<>]+') { $Matches[0] } else { $null }
    $name = ($from -replace '<[^>]+>', '').Trim().Trim('"')
    [pscustomobject]@{
        Soubor = Split-Path $path -Leaf; From = $from; FromAddress = $addr; FromName = $name
        Subject = $subject; Text = $result.Text; Html = $result.Html; Attachments = $result.Attachments
    }
}

# ---------- Přihlášení (Graph, kód zařízení) ----------

function Save-RefreshToken([string]$rt) {
    New-Item -ItemType Directory -Force $CacheDir | Out-Null
    ConvertTo-SecureString $rt -AsPlainText -Force | ConvertFrom-SecureString | Set-Content -Path $CacheFile -Encoding ASCII
}

function Read-RefreshToken {
    if (-not (Test-Path $CacheFile)) { return $null }
    try {
        $ss = Get-Content $CacheFile -Raw | ConvertTo-SecureString
        [Runtime.InteropServices.Marshal]::PtrToStringBSTR([Runtime.InteropServices.Marshal]::SecureStringToBSTR($ss))
    } catch { $null }
}

function Get-OAuthError($err) {
    try { ($err.ErrorDetails.Message | ConvertFrom-Json) } catch { [pscustomobject]@{ error = 'unknown'; error_description = $err.Exception.Message } }
}

function Get-GraphToken {
    $tokenUrl = "https://login.microsoftonline.com/$Tenant/oauth2/v2.0/token"
    $rt = Read-RefreshToken
    if ($rt) {
        try {
            $r = Invoke-RestMethod -Method Post -Uri $tokenUrl -Body @{ client_id = $ClientId; grant_type = 'refresh_token'; refresh_token = $rt; scope = $Scope }
            if ($r.refresh_token) { Save-RefreshToken $r.refresh_token }
            return $r.access_token
        } catch { Write-Host 'Uložené přihlášení vypršelo, přihlaste se znovu.' -ForegroundColor Yellow }
    }
    $dc = Invoke-RestMethod -Method Post -Uri "https://login.microsoftonline.com/$Tenant/oauth2/v2.0/devicecode" -Body @{ client_id = $ClientId; scope = $Scope }
    Write-Host ''
    Write-Host "PŘIHLÁŠENÍ: otevřete $($dc.verification_uri) a zadejte kód $($dc.user_code)" -ForegroundColor Cyan
    Write-Host 'Přihlaste se účtem, ze kterého se mají e-maily odeslat (lab účet).' -ForegroundColor Cyan
    Write-Host ''
    $interval = [int]$dc.interval; $deadline = (Get-Date).AddSeconds([int]$dc.expires_in)
    while ((Get-Date) -lt $deadline) {
        Start-Sleep -Seconds $interval
        try {
            $r = Invoke-RestMethod -Method Post -Uri $tokenUrl -Body @{ client_id = $ClientId; grant_type = 'urn:ietf:params:oauth:grant-type:device_code'; device_code = $dc.device_code }
            if ($r.refresh_token) { Save-RefreshToken $r.refresh_token }
            Write-Host 'Přihlášení OK.' -ForegroundColor Green
            return $r.access_token
        } catch {
            $e = Get-OAuthError $_
            switch ($e.error) {
                'authorization_pending' { }
                'slow_down' { $interval += 5 }
                default { throw "Přihlášení selhalo: $($e.error) $($e.error_description)" }
            }
        }
    }
    throw 'Kód pro přihlášení vypršel. Spusťte skript znovu.'
}

function Invoke-Graph([string]$method, [string]$path, $body, [string]$token) {
    $p = @{ Method = $method; Uri = "https://graph.microsoft.com/v1.0$path"; Headers = @{ Authorization = "Bearer $token" } }
    if ($null -ne $body) {
        $p.Body = [Text.Encoding]::UTF8.GetBytes(($body | ConvertTo-Json -Depth 10 -Compress))
        $p.ContentType = 'application/json; charset=utf-8'
    }
    try { Invoke-RestMethod @p } catch {
        $msg = try { ($_.ErrorDetails.Message | ConvertFrom-Json).error.message } catch { $_.Exception.Message }
        throw "Graph $method $path selhal: $msg"
    }
}

function New-GraphMessage($mail, [string]$to, [switch]$noOrigin) {
    $prefix = ''
    if (-not $noOrigin -and $mail.From) { $prefix = "Původní odesílatel: $($mail.From)" }
    if ($mail.Text -or -not $mail.Html) {
        $content = "$($mail.Text)"
        if ($prefix) { $content = "$prefix`r`n`r`n$content" }
        $body = @{ contentType = 'Text'; content = $content }
    } else {
        $content = $mail.Html
        if ($prefix) {
            $p = '<p>' + [Net.WebUtility]::HtmlEncode($prefix) + '</p>'
            $content = if ($content -match '(?i)<body[^>]*>') { $content -replace '(?i)(<body[^>]*>)', "`$1$p" } else { $p + $content }
        }
        $body = @{ contentType = 'HTML'; content = $content }
    }
    $msg = @{
        subject = $mail.Subject
        body = $body
        toRecipients = @(@{ emailAddress = @{ address = $to } })
        attachments = @($mail.Attachments | ForEach-Object {
            @{ '@odata.type' = '#microsoft.graph.fileAttachment'; name = $_.Name; contentType = $_.ContentType; contentBytes = [Convert]::ToBase64String($_.Bytes) }
        })
    }
    if ($mail.FromAddress -and -not $noOrigin) { $msg.replyTo = @(@{ emailAddress = @{ address = $mail.FromAddress; name = $mail.FromName } }) }
    $size = ($mail.Attachments | ForEach-Object { $_.Bytes.Length } | Measure-Object -Sum).Sum
    if ($size -gt 3MB) { Write-Warning "$($mail.Soubor): přílohy mají $([math]::Round($size/1MB,1)) MB, Graph sendMail bere nejvýš ~3 MB. Zmenšete fotku." }
    @{ message = $msg; saveToSentItems = $true }
}

# ---------- Hlavní část ----------

if ($Odhlasit -and (Test-Path $CacheFile)) { Remove-Item $CacheFile -Force; Write-Host 'Uložené přihlášení smazáno.' }

if ($Test) {
    $token = Get-GraphToken
    $me = Invoke-Graph GET '/me?$select=mail,userPrincipalName,displayName' $null $token
    $to = if ($me.mail) { $me.mail } else { $me.userPrincipalName }
    $png = [Convert]::FromBase64String('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN4qMHwHwAFZgJd0EGDEgAAAABJRU5ErkJggg==')
    $mail = [pscustomobject]@{
        Soubor = 'test'; From = 'Jana Testovací <jana.test@example.cz>'; FromAddress = 'jana.test@example.cz'; FromName = 'Jana Testovací'
        Subject = 'Test posli-emaily.ps1: Reklamace kávovaru (ěščřžýáíéůú)'; Html = $null
        Text = "Dobrý den,`r`ntoto je testovací e-mail ze skriptu posli-emaily.ps1. Diakritika: ěščřžýáíéůú ľĺôä.`r`nS pozdravem Jana"
        Attachments = @(@{ Name = 'test-foto.png'; ContentType = 'image/png'; Bytes = $png })
    }
    Invoke-Graph POST '/me/sendMail' (New-GraphMessage $mail $to) $token | Out-Null
    Write-Host "Testovací e-mail odeslán z $($me.userPrincipalName) na $to." -ForegroundColor Green
    return
}

if (-not (Test-Path $Slozka)) { throw "Složka '$Slozka' neexistuje. E-maily vyrobí část 1 (data/vstupy/), nebo zadejte -Slozka." }

if ($Emaily) {
    $names = $Emaily | ForEach-Object { $_ -split ',' } | ForEach-Object { $_.Trim() } | Where-Object { $_ } |
        ForEach-Object { if ($_ -like '*.eml') { $_ } else { "$_.eml" } }
    $files = foreach ($n in $names) {
        $f = Join-Path $Slozka $n
        if (-not (Test-Path $f)) { throw "Soubor '$f' neexistuje." }
        Get-Item $f
    }
} else {
    $files = Get-ChildItem -Path $Slozka -Filter *.eml | Sort-Object Name
}
if (-not $files) { throw "Ve složce '$Slozka' nejsou žádné .eml soubory." }

$mails = $files | ForEach-Object { Read-Eml $_.FullName }

$token = $null
if (-not $WhatIfPreference) {
    if (-not $Komu) { throw 'Zadejte adresu sdílené schránky: -Komu reklamace@... (nebo proměnnou prostředí REKLAMACE_SCHRANKA).' }
    $token = Get-GraphToken
}

$i = 0
foreach ($m in $mails) {
    $i++
    $info = "$($m.Soubor): '$($m.Subject)' od $($m.From), $($m.Attachments.Count) příloh"
    if ($PSCmdlet.ShouldProcess($Komu, "Odeslat $info")) {
        Invoke-Graph POST '/me/sendMail' (New-GraphMessage $m $Komu -noOrigin:$BezPuvodnihoOdesilatele) $token | Out-Null
        Write-Host "Odesláno $info" -ForegroundColor Green
        if ($i -lt $mails.Count) { Start-Sleep -Seconds $Pauza }
    }
}
