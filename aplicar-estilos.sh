#!/bin/bash

# Script para aplicar estilos customizados no GeoNode
# Uso: ./aplicar-estilos.sh [home|css|all]
#
# Arquivos principais:
#   - geonode/templates/home.html        -> CSS da página inicial (MapStore)
#   - geonode/static/geonode/css/custom.css -> CSS de outras páginas

COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[1;33m'
COLOR_BLUE='\033[0;34m'
COLOR_RED='\033[0;31m'
COLOR_RESET='\033[0m'

echo -e "${COLOR_BLUE}===========================================
  GeoNode - Aplicar Estilos Customizados
===========================================${COLOR_RESET}"

case "$1" in
  home)
    echo -e "${COLOR_YELLOW}Aplicando mudanças na TELA INICIAL (home.html)...${COLOR_RESET}"
    echo "1. Reiniciando Django..."
    docker compose restart django
    echo "2. Aguardando Django iniciar (30s)..."
    sleep 30
    echo -e "${COLOR_GREEN}✅ Pronto!${COLOR_RESET}"
    echo -e "${COLOR_YELLOW}⚠️  Pressione Ctrl+Shift+R no navegador para ver as mudanças${COLOR_RESET}"
    ;;

  css)
    echo -e "${COLOR_YELLOW}Aplicando mudanças no custom.css...${COLOR_RESET}"
    echo "1. Executando collectstatic..."
    docker compose exec django python manage.py collectstatic --noinput
    echo "2. Recarregando nginx..."
    docker exec nginx4geonode nginx -s reload 2>/dev/null || echo "nginx reload opcional"
    echo -e "${COLOR_GREEN}✅ Pronto!${COLOR_RESET}"
    echo -e "${COLOR_YELLOW}⚠️  Pressione Ctrl+Shift+R no navegador para ver as mudanças${COLOR_RESET}"
    ;;

  all)
    echo -e "${COLOR_YELLOW}Aplicando TODAS as mudanças...${COLOR_RESET}"
    echo "1. Executando collectstatic..."
    docker compose exec django python manage.py collectstatic --noinput
    echo "2. Reiniciando Django..."
    docker compose restart django
    echo "3. Aguardando Django iniciar (30s)..."
    sleep 30
    echo "4. Recarregando nginx..."
    docker exec nginx4geonode nginx -s reload 2>/dev/null || echo "nginx reload opcional"
    echo -e "${COLOR_GREEN}✅ Pronto!${COLOR_RESET}"
    echo -e "${COLOR_YELLOW}⚠️  Pressione Ctrl+Shift+R no navegador para ver as mudanças${COLOR_RESET}"
    ;;

  status)
    echo -e "${COLOR_YELLOW}Verificando status dos containers...${COLOR_RESET}"
    docker compose ps
    ;;

  *)
    echo "Uso: $0 [home|css|all|status]"
    echo ""
    echo -e "${COLOR_BLUE}Opções:${COLOR_RESET}"
    echo "  home   - Aplica mudanças na TELA INICIAL"
    echo "           Arquivo: geonode/templates/home.html"
    echo ""
    echo "  css    - Aplica mudanças em OUTRAS PÁGINAS"
    echo "           Arquivo: geonode/static/geonode/css/custom.css"
    echo ""
    echo "  all    - Aplica TODAS as mudanças"
    echo ""
    echo "  status - Verifica status dos containers"
    echo ""
    echo -e "${COLOR_BLUE}Exemplos:${COLOR_RESET}"
    echo "  $0 home    # Depois de editar home.html"
    echo "  $0 css     # Depois de editar custom.css"
    echo "  $0 all     # Aplica tudo"
    echo ""
    exit 1
    ;;
esac

echo ""
echo -e "${COLOR_BLUE}📝 Lembre-se:${COLOR_RESET}"
echo "  - Sempre pressione Ctrl+Shift+R no navegador"
echo "  - Se não funcionar, limpe o cache: Ctrl+Shift+Delete"
