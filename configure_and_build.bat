@echo off
echo y | eas build:configure
echo y | eas build --platform ios --profile production-ios
