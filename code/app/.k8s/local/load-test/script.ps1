$endpoint = 'http://20.53.196.76:2999'


$n = Get-Random -Minimum 1 -Maximum 10
Write-Host "Number of events: $n"
@(1..$n) | ForEach-Object {
    try {
        Invoke-WebRequest -Uri $endpoint
    }
    catch {
        Write-Host "Error: $_"
    }
}

<#
docker build -t rose-app-load-test:latest .
docker run rose-app-load-test:latest
docker-compose up --scale rose-app-load-test=10
docker-compose down
#>
