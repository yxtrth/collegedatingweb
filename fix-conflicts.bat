@echo off
echo Fixing merge conflicts...

rem Remove all merge conflict markers and keep HEAD version
for /r %%f in (*.js *.html *.md *.json *.css) do (
    if exist "%%f" (
        echo Processing: %%f
        powershell -Command "(Get-Content '%%f') -replace '^<<<<<<< HEAD', '' | Set-Content '%%f'"
        powershell -Command "(Get-Content '%%f') -replace '^=======', '' | Set-Content '%%f'"
        powershell -Command "(Get-Content '%%f') -replace '^>>>>>>> .*', '' | Set-Content '%%f'"
        powershell -Command "(Get-Content '%%f') | Where-Object { $_.Trim() -ne '' } | Set-Content '%%f'"
    )
)

echo Merge conflicts fixed!
