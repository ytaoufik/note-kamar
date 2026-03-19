# Deploy to Vercel with automated inputs
$projectPath = "c:\Users\yasmine\OneDrive\Desktop\note kamar"
Set-Location $projectPath

# Create a process that will handle interactive Vercel CLI
$pInfo = New-Object System.Diagnostics.ProcessStartInfo
$pInfo.FileName = "vercel"
$pInfo.Arguments = "--prod --skip-build"
$pInfo.RedirectStandardInput = $true
$pInfo.RedirectStandardOutput = $true
$pInfo.UseShellExecute = $false
$pInfo.CreateNoWindow = $false

$process = [System.Diagnostics.Process]::Start($pInfo)

# Send inputs to the process
$process.StandardInput.WriteLine("yes")  # Set up and deploy?
Start-Sleep -Milliseconds 500
$process.StandardInput.WriteLine("")  # Use default scope
Start-Sleep -Milliseconds 500
$process.StandardInput.WriteLine("n")  # Link to existing?
Start-Sleep -Milliseconds 500
$process.StandardInput.WriteLine("note-kamar")  # Project name
Start-Sleep -Milliseconds 500
$process.StandardInput.WriteLine("")  # Root directory
Start-Sleep -Milliseconds 1000

$output = $process.StandardOutput.ReadToEnd()
$process.WaitForExit()

Write-Host $output
