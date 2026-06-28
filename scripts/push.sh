##!/bin/bash
#set -e
#
## --- CONFIGURATION ---
#APP_PACKAGE="com.example.app"
#TARGET_DIR="/sdcard/Documents/MyHybridMobile"
#ADB=/mnt/c/usr/bin/adb.exe
#
#echo "---------------------------------------------------"
#echo "Instantly syncing web assets via dedicated ADB channels..."
#echo "---------------------------------------------------"
#
## Clean up any leftover test files locally
#rm -f ./assets_temp.tar
#
## 1. Force cleanup and explicit verification of the target staging directory
#echo "Preparing staging directories on device..."
#$ADB shell "rm -rf $TARGET_DIR"
#$ADB shell "mkdir -p $TARGET_DIR/www"
#
## 2. Channel 1: Push root level files only (safely into the confirmed directory)
#echo "Pushing root configuration files..."
#find . -maxdepth 1 -type f | while read -r file; do
#    clean_file="${file#./}"
#    $ADB push "$clean_file" "$TARGET_DIR/www/$clean_file" > /dev/null
#done
#
## 3. Channel 2: Push required source and asset directories directly
#echo "Pushing target directories (src, public, dist)..."
#$ADB push "src" "$TARGET_DIR/www/src" > /dev/null
#$ADB push "public" "$TARGET_DIR/www/public" > /dev/null
#$ADB push "dist" "$TARGET_DIR/www/dist" > /dev/null
#
## 4. Securely copy everything into the sandbox
#echo "Deploying to secure sandbox..."
#$ADB shell "run-as $APP_PACKAGE rm -rf files/www"
#$ADB shell "run-as $APP_PACKAGE cp -r $TARGET_DIR/www files/"
#
## 5. Clean up public staging files from the phone
## $ADB shell "rm -rf $TARGET_DIR"
#
## 6. Force reload
#echo "Sending reload broadcast to WebView layer..."
#$ADB shell am broadcast -a "$APP_PACKAGE.ACTION_RELOAD_WEBVIEW" > /dev/null
#
#echo "---------------------------------------------------"
#echo "Sync Complete! Assets updated in real-time."
#echo "---------------------------------------------------"
#
#

#!/bin/bash
set -e

# --- CONFIGURATION ---
APP_PACKAGE="com.example.app"
TARGET_DIR="/sdcard/Documents/MyHybridMobile"
ADB=/mnt/c/usr/bin/adb.exe

# Define exactly which root files are required by your app setup
ROOT_FILES=(
    "index.html"
    "index.sfc.html"
    "index.vite.html"
    "error.html"
    "package.json"
    "vite.config.js"
    "serve.sh"
    "README.md"
    "a.txt"
)

echo "---------------------------------------------------"
echo "Instantly syncing web assets via dedicated ADB channels..."
echo "---------------------------------------------------"

# Clean up local leftovers
rm -f ./assets_temp.tar

# 1. Force clear and create the main workspace directory tree synchronously
echo "Preparing staging directories on device..."
$ADB shell "rm -rf '$TARGET_DIR' && mkdir -p '$TARGET_DIR/www'"

# 2. Channel 1: Push verified root level files only
echo "Pushing root configuration files..."
for file in "${ROOT_FILES[@]}"; do
    if [ -f "$file" ]; then
        $ADB push "$file" "$TARGET_DIR/www/$file" > /dev/null
    else
        echo "Skipping optional file: $file"
    fi
done

# 3. Channel 2: Push required source and asset directories directly
echo "Pushing target directories (src, public, dist)..."
$ADB push "src" "$TARGET_DIR/www/src" > /dev/null
#$ADB push "public" "$TARGET_DIR/www/public" > /dev/null
$ADB push "dist" "$TARGET_DIR/www/dist" > /dev/null

# 4. Securely copy everything into the sandbox
echo "Deploying to secure sandbox..."
$ADB shell "run-as $APP_PACKAGE rm -rf files/www"
$ADB shell "run-as $APP_PACKAGE cp -r $TARGET_DIR/www files/"

# 5. Force reload
echo "Sending reload broadcast to WebView layer..."
$ADB shell am broadcast -a "$APP_PACKAGE.ACTION_RELOAD_WEBVIEW" > /dev/null

echo "---------------------------------------------------"
echo "Sync Complete! Assets updated in real-time."
echo "---------------------------------------------------"

