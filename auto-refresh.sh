#!/bin/bash
# Solução completa: monitorar + collectstatic automático

echo "🚀 Configurando auto-refresh para desenvolvimento"
echo ""

# 1. Reiniciar containers com nova configuração
echo "1. Reiniciando containers..."
docker compose restart django

echo ""
echo "2. Aguardando Django (10s)..."
sleep 10

# 3. Collectstatic inicial
echo ""
echo "3. Sincronizando arquivos estáticos..."
docker compose exec django python manage.py collectstatic --noinput --clear

echo ""
echo "✓ Configuração concluída!"
echo ""
echo "Agora você tem 2 opções:"
echo ""
echo "  A) Auto-reload com watcher (recomendado):"
echo "     ./watch-css.sh"
echo ""
echo "  B) Refresh manual quando precisar:"
echo "     ./refresh.sh"
echo ""
echo "Após mudanças, use Ctrl+Shift+R no navegador"
