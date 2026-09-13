@echo off
chcp 65001 >nul
:: Navega ate a pasta do projeto (garantia)
cd /d "D:\Users\Admin\Developer\PersonControl\personcontrol-app"

echo [1/2] Enviando para produção no servidor Vercel...
call vercel --prod --yes

echo [2/2] Atualizando no github...
set /p commit="Digite a descrição do novo commit: "
call git add .
call git commit -m "%commit%"
call git push origin main


echo Processo concluido com sucesso! O script sera encerrado em 10 segundos...
timeout /t 10 /nobreak >nul