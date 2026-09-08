@echo off
:: Navega ate a pasta do projeto (garantia)
cd /d "D:\Users\Admin\Developer\PersonControl\personcontrol-app"

echo [1/4] Executando npm run build...
call npm run build

echo [2/4] Sincronizando com Android (Capacitor)...
call npx cap sync android

echo [3/4] Entrando na pasta do Android e gerando o APK Release...
cd android
call gradlew assembleRelease

echo [4/4] Copiando o APK gerado para a raiz do projeto...
cd /d "D:\Users\Admin\Developer\PersonControl\personcontrol-app"
copy "android\app\build\outputs\apk\release\app-release.apk" "D:\Users\Admin\Developer\PersonControl\personcontrol-app\"

echo Processo concluido com sucesso!
pause