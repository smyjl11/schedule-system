@echo off
chcp 65001 >nul
echo ============================================
echo   员工日程管理系统 - 一键启动
echo ============================================
echo.

:: 使用系统 Node.js（需 >= 22.5 以使用内置 node:sqlite）
:: 注意：不要用 IDE 内置的旧 Node（如 Node 20），它不含 node:sqlite
set "SYS_NODE=C:\Program Files\nodejs"
if exist "%SYS_NODE%\node.exe" (
    set "PATH=%SYS_NODE%;%PATH%"
    echo 使用系统 Node:
    "%SYS_NODE%\node.exe" --version
) else (
    where node >nul 2>nul
    if %errorlevel% neq 0 (
        echo ❌ 未找到 Node.js，请安装 Node.js 22.5+：https://nodejs.org
        pause
        exit /b 1
    )
    echo 使用 PATH 中的 Node...
    node --version
)

:: 校验 node:sqlite 是否可用（Node >= 22.5 内置）
node -e "try{require('node:sqlite');console.log('[OK] node:sqlite 可用')}catch(e){console.error('[错误] 当前 Node 不支持 node:sqlite，请升级到 Node.js 22.5 及以上');process.exit(1)}" 2>nul
if %errorlevel% neq 0 (
    echo ❌ node:sqlite 不可用，请确认使用的是 Node.js 22.5 及以上版本
    pause
    exit /b 1
)

echo.
echo 启动服务器...
echo.
echo ✅ 启动成功！浏览器访问: http://localhost:3000
echo.
echo 按 Ctrl+C 停止服务器（会自动清理数据库残留）
echo ============================================
echo.

call npm run dev

echo.
echo ============================================
echo   服务器已停止
echo ============================================
echo.
echo 提示：如需清理 .next 构建缓存，运行：
echo   npm run clean
echo.
pause
