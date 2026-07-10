@echo off
chcp 65001 >nul
echo ============================================
echo   员工日程管理系统 - 一键启动
echo ============================================
echo.

:: 优先使用 IDE 内置 Node 20（与 better-sqlite3 预编译版本匹配）；找不到再回退系统 Node
set "IDE_NODE=C:\Users\18858\.workbuddy\binaries\node\versions\20.18.0.installing.273620.__extract_temp__\node-v20.18.0-win-x64"
if exist "%IDE_NODE%\node.exe" (
    set "PATH=%IDE_NODE%;%PATH%"
    echo 使用 IDE 内置 Node 20...
) else (
    where node >nul 2>nul
    if %errorlevel% neq 0 (
        echo ❌ 未找到任何 Node.js，请安装 Node.js：https://nodejs.org
        pause
        exit /b 1
    )
    echo 使用系统 Node...
)

echo [1/3] 安装依赖...
call npm install --no-audit --no-fund
if %errorlevel% neq 0 (
    echo.
    echo ❌ npm install 失败！请下载 Node.js: https://nodejs.org
    pause
    exit /b 1
)

:: 安全检查：确保 better-sqlite3 原生模块与当前 Node ABI 匹配
set "NATIVE_MODULE=node_modules\better-sqlite3\build\Release\better_sqlite3.node"
if exist "%NATIVE_MODULE%" (
    node -e "try{require('better-sqlite3')}catch(e){process.exit(1)}" 2>nul
    if %errorlevel% neq 0 (
        echo [警告] better-sqlite3 ABI 不匹配，重新编译...
        call npm rebuild better-sqlite3 2>&1
        :: 二次验证
        node -e "try{require('better-sqlite3')}catch(e){process.exit(1)}" 2>nul
        if %errorlevel% neq 0 (
            echo.
            echo ============================================
            echo ❌ better-sqlite3 重新编译失败！
            echo    可能原因：缺少 C++ 编译工具链
            echo.
            echo    解决方法 ^(任选其一^)：
            echo    1. 安装 Visual Studio 2022 生成工具：
            echo       https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
            echo       勾选 "Desktop development with C++" 工作负载
            echo.
            echo    2. 切换到 Node.js 22 LTS：
            echo       https://nodejs.org 下载 v22 LTS
            echo ============================================
            pause
            exit /b 1
        )
        echo [完成] better-sqlite3 重新编译成功
    )
)

echo.
echo [2/3] 初始化数据库...
call npm run setup
if %errorlevel% neq 0 (
    echo ❌ 数据库初始化失败
    pause
    exit /b 1
)

echo.
echo [3/3] 启动服务器...
echo.
echo ✅ 启动成功！浏览器访问: http://localhost:3000
echo.
echo 按 Ctrl+C 停止服务器
echo ============================================
echo.

call npm run dev
pause
