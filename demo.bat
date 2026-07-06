:: demo.bat -- Migration Demo Script for STeh Recepti

:: Usage: demo.bat

setlocal enabledelayedexpansion
set MONGODB_URI=mongodb://root:rootpassword@localhost:27017/steh-recepti?authSource=admin
set CONTAINER=steh-recepti-backend
set MONGO=steh-recepti-mongodb

:menu
cls
echo ================================================================
echo   STeh Recepti -- Migration Demo
echo ================================================================
echo.
echo   Migration 1: Add role field to users
echo     [1a] Show current state (check marko123 role)
echo     [1b] Rollback (remove role)
echo     [1c] Re-apply (restore role)
echo.
echo   Migration 2: Add reset token fields
echo     [2a] Show current state (check resetToken exists)
echo     [2b] Rollback (remove fields)
echo     [2c] Re-apply (restore fields)
echo.
echo   Migration 3: Add liked field
echo     [3a] Show current state (check liked array)
echo     [3b] Rollback (remove liked)
echo     [3c] Re-apply (restore liked)
echo.
echo   Migration 4: Extract ratings to separate collection
echo     [4a] Show current state (ratings as ObjectId refs)
echo     [4b] Rollback (embed ratings back)
echo     [4c] Re-apply (extract again)
echo.
echo   Migration 5: Enum expansion (schema-only)
echo     [5a] Show Recipe model enum values
echo     [5b] Rollback (no-op with message)
echo     [5c] Re-apply (no-op with message)
echo.
echo   General:
echo     [s]  Show migration status
echo     [up] Run ALL pending migrations
echo     [q]  Quit
echo.
set /p choice="Enter choice: "

if "%choice%"=="1a" goto m1a
if "%choice%"=="1b" goto m1b
if "%choice%"=="1c" goto m1c
if "%choice%"=="2a" goto m2a
if "%choice%"=="2b" goto m2b
if "%choice%"=="2c" goto m2c
if "%choice%"=="3a" goto m3a
if "%choice%"=="3b" goto m3b
if "%choice%"=="3c" goto m3c
if "%choice%"=="4a" goto m4a
if "%choice%"=="4b" goto m4b
if "%choice%"=="4c" goto m4c
if "%choice%"=="5a" goto m5a
if "%choice%"=="5b" goto m5b
if "%choice%"=="5c" goto m5c
if "%choice%"=="s"  goto status
if "%choice%"=="up" goto runall
if "%choice%"=="q"  goto end
if "%choice%"=="Q"  goto end
echo Unknown choice. Press any key...
pause >nul
goto menu

rem ==================================================================
rem Migration 1: Add role to users
rem ==================================================================

:m1a
echo.
echo --- M1: Current state ---
docker compose exec %MONGO% mongo -u root -p rootpassword --authenticationDatabase admin steh-recepti --eval "print('marko123 role:', db.users.findOne({username:'marko123'},{_id:0,username:1,role:1}).role); print('total users with role:', db.users.countDocuments({role:{\$exists:true}}))" 2>&1 | findstr /V "Implicit MongoDB mongo shell"
echo.
echo Press any key to return...
pause >nul
goto menu

:m1b
echo.
echo --- M1: Rolling back (removing role field)... ---
docker compose exec %CONTAINER% npx migrate-mongo down 2>&1 | findstr "MIGRATED DOWN PASSED"
echo.
echo --- Checking: marko123 after rollback ---
docker compose exec %MONGO% mongo -u root -p rootpassword --authenticationDatabase admin steh-recepti --eval "var u=db.users.findOne({username:'marko123'},{_id:0,username:1,role:1}); print('Role exists:', u.role !== undefined ? u.role : 'NO (removed)')" 2>&1 | findstr "Role"
echo.
echo Press any key to return...
pause >nul
goto menu

:m1c
echo.
echo --- M1: Re-applying (restoring role field)... ---
docker compose exec %CONTAINER% npx migrate-mongo up 2>&1 | findstr "MIGRATED UP PASSED"
echo.
echo --- Checking: marko123 after re-apply ---
docker compose exec %MONGO% mongo -u root -p rootpassword --authenticationDatabase admin steh-recepti --eval "print('marko123 role:', db.users.findOne({username:'marko123'},{_id:0,username:1,role:1}).role)" 2>&1 | findstr "role:"
echo.
echo Press any key to return...
pause >nul
goto menu

rem ==================================================================
rem Migration 2: Add reset token fields
rem ==================================================================

:m2a
echo.
echo --- M2: Current state ---
docker compose exec %MONGO% mongo -u root -p rootpassword --authenticationDatabase admin steh-recepti --eval "var u=db.users.findOne({username:'marko123'}); print('resetToken field exists:', u.resetToken !== undefined); print('resetTokenExpires field exists:', u.resetTokenExpires !== undefined)" 2>&1 | findstr "field exists"
echo.
echo Press any key to return...
pause >nul
goto menu

:m2b
echo.
echo --- M2: Rolling back (removing reset token fields)... ---
docker compose exec %CONTAINER% npx migrate-mongo down 2>&1 | findstr "MIGRATED DOWN PASSED"
echo.
echo --- Checking after rollback ---
docker compose exec %MONGO% mongo -u root -p rootpassword --authenticationDatabase admin steh-recepti --eval "var u=db.users.findOne({username:'marko123'}); print('resetToken exists:', u.resetToken !== undefined)" 2>&1 | findstr "resetToken"
echo.
echo Press any key to return...
pause >nul
goto menu

:m2c
echo.
echo --- M2: Re-applying (restoring fields)... ---
docker compose exec %CONTAINER% npx migrate-mongo up 2>&1 | findstr "MIGRATED UP PASSED"
echo.
echo Press any key to return...
pause >nul
goto menu

rem ==================================================================
rem Migration 3: Add liked field
rem ==================================================================

:m3a
echo.
echo --- M3: Current state ---
docker compose exec %MONGO% mongo -u root -p rootpassword --authenticationDatabase admin steh-recepti --eval "var u=db.users.findOne({username:'marko123'}); print('liked exists:', u.liked !== undefined, '| value:', JSON.stringify(u.liked))" 2>&1 | findstr "liked"
echo.
echo Press any key to return...
pause >nul
goto menu

:m3b
echo.
echo --- M3: Rolling back (removing liked field)... ---
docker compose exec %CONTAINER% npx migrate-mongo down 2>&1 | findstr "MIGRATED DOWN PASSED"
rem M3 down removes liked, but M2 was also rolled. Need to re-up M2 first.
echo NOTE: If M2 also rolled back, re-run 2c to restore before testing.
echo.
echo Press any key to return...
pause >nul
goto menu

:m3c
echo.
echo --- M3: Re-applying (restoring liked field)... ---
docker compose exec %CONTAINER% npx migrate-mongo up 2>&1 | findstr "MIGRATED UP PASSED"
echo.
echo Press any key to return...
pause >nul
goto menu

rem ==================================================================
rem Migration 4: Extract ratings (the impressive one)
rem ==================================================================

:m4a
echo.
echo ================================================================
echo   M4: Ratings extracted to separate collection (CURRENT STATE)
echo ================================================================
echo.
docker compose exec %MONGO% mongo -u root -p rootpassword --authenticationDatabase admin steh-recepti --eval "print('Ratings collection count:', db.ratings.countDocuments({})); var r=db.recipes.findOne({id:1}); print('Recipe #1 ratings type:', typeof r.ratings[0]); print('Recipe #1 total ratings:', r.totalRatings)" 2>&1 | findstr "Ratings Recipe"
echo.
echo Press any key to return...
pause >nul
goto menu

:m4b
echo.
echo ================================================================
echo   M4: Rolling back (embedding ratings into recipes)
echo ================================================================
echo.
docker compose exec %CONTAINER% npx migrate-mongo down 2>&1 | findstr "MIGRATED DOWN PASSED"
echo.
echo --- After rollback ---
docker compose exec %MONGO% mongo -u root -p rootpassword --authenticationDatabase admin steh-recepti --eval "print('Ratings collection exists:', db.getCollectionNames().indexOf('ratings') >= 0 ? 'yes' : 'NO (dropped)'); var r=db.recipes.findOne({id:1}); print('Recipe #1 rating type:', typeof r.ratings[0]); print('Recipe #1 first rating:', JSON.stringify(r.ratings[0]))" 2>&1 | findstr "Ratings Recipe"
echo.
echo ================================================================
echo   Ratings are now EMBEDDED inside each recipe.
echo   The ratings COLLECTION no longer exists.
echo ================================================================
echo.
echo Press any key to return...
pause >nul
goto menu

:m4c
echo.
echo ================================================================
echo   M4: Re-applying (extracting ratings back to collection)
echo ================================================================
echo.
docker compose exec %CONTAINER% npx migrate-mongo up 2>&1 | findstr "MIGRATED UP PASSED"
echo.
echo --- After re-apply ---
docker compose exec %MONGO% mongo -u root -p rootpassword --authenticationDatabase admin steh-recepti --eval "print('Ratings collection restored:', db.ratings.countDocuments({}), 'documents'); var r=db.recipes.findOne({id:1}); print('Recipe #1 ratings type:', typeof r.ratings[0]); print('Recipe #1 has', r.ratings.length, 'ObjectId refs')" 2>&1 | findstr "Ratings Recipe"
echo.
echo ================================================================
echo   Ratings are now back in a SEPARATE collection.
echo ================================================================
echo.
echo Press any key to return...
pause >nul
goto menu

rem ==================================================================
rem Migration 5: Enum expansion
rem ==================================================================

:m5a
echo.
echo --- M5: Recipe model enum values ---
docker compose exec %CONTAINER% node -e "const Recipe=require('./src/models/Recipe'); var s=Recipe.schema.path('meat'); console.log('meat enum:', s.enumValues); var c=Recipe.schema.path('cookingMethod'); console.log('cookingMethod enum:', c.enumValues)" 2>&1 | findstr "enum:"
echo.
echo Press any key to return...
pause >nul
goto menu

:m5b
echo.
echo --- M5: Rollback (schema-only, no data change)... ---
docker compose exec %CONTAINER% npx migrate-mongo down 2>&1 | findstr "MIGRATED DOWN"
echo.
echo Press any key to return...
pause >nul
goto menu

:m5c
echo.
echo --- M5: Re-apply (schema-only, no data change)... ---
docker compose exec %CONTAINER% npx migrate-mongo up 2>&1 | findstr "MIGRATED UP"
echo.
echo Press any key to return...
pause >nul
goto menu

rem ==================================================================
rem Status / Run All
rem ==================================================================

:status
echo.
echo --- Migration Status ---
docker compose exec %CONTAINER% npx migrate-mongo status 2>&1 | findstr "PENDING APPLIED 202606 Filename Applied Migration"
echo.
echo Press any key to return...
pause >nul
goto menu

:runall
echo.
echo --- Running ALL pending migrations ---
docker compose exec %CONTAINER% npx migrate-mongo up 2>&1 | findstr "MIGRATED PASSED"
echo.
echo Press any key to return...
pause >nul
goto menu

:end
endlocal
echo Done.
