@echo off
setlocal
cd /d "%~dp0"

set "LOG=%TEMP%\play-your-hand-cloudflared.log"
del /q "%LOG%" 2>nul

echo Starting PLAY YOUR HAND server...
start "PLAY YOUR HAND SERVER" /D "%~dp0" cmd /k npm start

timeout /t 3 /nobreak >nul

echo Starting Cloudflare Quick Tunnel...
start "PLAY YOUR HAND CLOUDFLARE" cmd /k cloudflared tunnel --logfile "%LOG%" --url http://localhost:10000

echo Waiting for the Cloudflare address...

powershell -NoProfile -ExecutionPolicy Bypass -Command "$log=$env:TEMP + '\\play-your-hand-cloudflared.log'; $url=$null; for($i=0;$i -lt 60;$i++){ Start-Sleep -Milliseconds 500; if(Test-Path $log){ $text=Get-Content $log -Raw -ErrorAction SilentlyContinue; $m=[regex]::Matches($text,'https://[a-z0-9-]+\.trycloudflare\.com'); if($m.Count -gt 0){$url=$m[$m.Count-1].Value; break} } }; if($url){ Write-Host ('Cloudflare URL: '+$url); Set-Content -Path (Join-Path (Get-Location) 'cloudflare-url.txt') -Value $url -NoNewline; $qrFile=Join-Path ([Environment]::GetFolderPath('Desktop')) 'PLAY YOUR HAND QR.png'; $qrTarget=$url+'/host'; $qrUrl='https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data='+[uri]::EscapeDataString($qrTarget); try { & curl.exe -L --fail --silent --show-error -o $qrFile $qrUrl; Write-Host ('Laptop QR refreshed for '+$qrTarget) } catch { Write-Host 'Laptop QR could not be refreshed, but the tunnel URL was saved.' }; Start-Process ('http://localhost:10000/host/?publicUrl='+[uri]::EscapeDataString($url)) } else { Write-Host 'Cloudflare URL was not detected. Opening the local host page.'; Start-Process 'http://localhost:10000/host/' }"

endlocal
