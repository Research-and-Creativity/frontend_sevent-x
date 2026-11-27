@echo off
title SEVENT X - Live Visual Testing Walkthrough
cd /d "%~dp0\.."
echo ========================================================
echo   SEVENT X - LIVE AUTOMATED VISUAL DEMO WALKTHROUGH
echo ========================================================
echo.
echo Menjalankan live test interaktif...
node scripts/live-visual-demo.mjs
echo.
echo Pengujian telah selesai! Tekan sembarang tombol untuk menutup.
pause
