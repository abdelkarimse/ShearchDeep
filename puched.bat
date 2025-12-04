@echo off
setlocal

:: Ask for branch name
set /p branchName=Enter the new branch name:

:: Ask for commit message
set /p commitMsg=Enter the commit message:

echo Creating branch %branchName% with commit message "%commitMsg%"...

:: Create and switch to new branch
git checkout -b %branchName%

:: Stage changes
git add .

:: Commit with the message entered
git commit -m "%commitMsg%"

:: Fetch latest from origin
git fetch origin

:: Go back to main and pull updates
git checkout main
git pull origin main

:: Switch back to your new branch
git checkout %branchName%

:: Push new branch to origin
git push origin %branchName%

echo.
echo Branch "%branchName%" created and pushed successfully with commit "%commitMsg%"!
pause
