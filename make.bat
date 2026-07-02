@echo off
:: make.bat - Windows wrapper for Makefile targets
:: Usage: make.bat <target>
:: Falls back to direct commands if GNU Make is not installed.

setlocal

:: Check if GNU Make is installed (look for .exe to avoid matching ourselves)
where make.exe >nul 2>&1
if %errorlevel% == 0 (
    make %*
    exit /b %errorlevel%
)

:: ---------- Fallback: direct commands (no Make required) -------------------

set TARGET=%1

if "%TARGET%"=="" goto :help
if "%TARGET%"=="help" goto :help

:: Docker targets
if "%TARGET%"=="up" goto :up
if "%TARGET%"=="down" goto :down
if "%TARGET%"=="build-docker" goto :build-docker
if "%TARGET%"=="logs" goto :logs
if "%TARGET%"=="ps" goto :ps
if "%TARGET%"=="clean-all" goto :clean-all

:: Frontend targets
if "%TARGET%"=="install" goto :install
if "%TARGET%"=="dev" goto :dev
if "%TARGET%"=="build" goto :build
if "%TARGET%"=="start" goto :start
if "%TARGET%"=="test" goto :test
if "%TARGET%"=="lint" goto :lint
if "%TARGET%"=="format" goto :format
if "%TARGET%"=="clean" goto :clean

echo Unknown target: %TARGET%
goto :help

:help
echo.
echo Usage: make.bat ^<target^>
echo.
echo   Docker targets:
echo     up             Start all services (docker compose up -d)
echo     down           Stop all services (docker compose down)
echo     build-docker   Build all Docker images (docker compose build)
echo     logs           Tail all service logs (docker compose logs -f)
echo     ps             List running containers (docker compose ps)
echo     clean-all      Stop services, remove volumes + node_modules + dist
echo.
echo   Frontend targets (commands run inside frontend/):
echo     install        Install Angular dependencies
echo     dev            Run the Angular dev server
echo     build          Build the Angular app
echo     start          Run the Angular dev server
echo     test           Run unit tests
echo     lint           Lint TypeScript sources
echo     format         Format source and config files
echo     clean          Remove frontend/dist, frontend/coverage, and logs
echo.
goto :end

:: ---- Docker targets -------------------------------------------------------

:up
    docker compose up -d
    goto :end

:down
    docker compose down
    goto :end

:build-docker
    docker compose build
    goto :end

:logs
    docker compose logs -f
    goto :end

:ps
    docker compose ps
    goto :end

:clean-all
    docker compose down -v
    if exist frontend
ode_modules\ rmdir /s /q frontend
ode_modules    if exist frontend\dist\ rmdir /s /q frontend\dist    if exist frontend\coverage\ rmdir /s /q frontend\coverage    if exist backend
ode_modules\ rmdir /s /q backend
ode_modules    goto :end

:: ---- Frontend targets ----------------------------------------------------

:install
    cd frontend && npm install
    goto :end

:dev
    cd frontend && npm run start
    goto :end

:build
    cd frontend && npm run build
    goto :end

:start
    cd frontend && npm run start
    goto :end

:test
    cd frontend && npm run test
    goto :end

:lint
    cd frontend && npm run lint
    goto :end

:format
    cd frontend && npm run format
    goto :end

:clean
    echo Cleaning frontend\dist\, frontend\coverage\, and logs\...
    if exist frontend\dist\ rmdir /s /q frontend\dist    if exist frontend\coverage\ rmdir /s /q frontend\coverage    if exist logs\ (
        for /f "delims=" %%i in ('dir /b logs') do (
            if not "%%i"==".gitkeep" del /q "logs\%%i" 2>nul
        )
    )
    echo Done.
    goto :end

:end
endlocal
