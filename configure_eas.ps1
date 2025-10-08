$process = Start-Process -FilePath "eas" -ArgumentList "build:configure" -NoNewWindow -PassThru -RedirectStandardInput -RedirectStandardOutput -RedirectStandardError
$process.StandardInput.WriteLine("y")
$process.StandardInput.Close()
$process.WaitForExit()
Write-Host "Exit code: $($process.ExitCode)"
