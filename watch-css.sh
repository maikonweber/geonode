#!/bin/bash
# Auto-reload CSS/JS/HTML quando detectar mudanças

echo "👀 Monitorando mudanças (CSS, JS, HTML)..."
echo "Ctrl+C para parar"
echo ""

# Instalar inotify se não existir
if ! command -v inotifywait &> /dev/null; then
    echo "Instalando inotify-tools..."
    sudo apt-get install -y inotify-tools
fi

# Monitorar mudanças (incluindo close_write para VSCode)
inotifywait -m -r -e modify,create,delete,close_write,moved_to \
    --exclude '(__pycache__|\.pyc|\.git|\.swp|~)' \
    ./catalogue_custom/ \
    ./home_custom/ \
    ./geonode/static/geonode/ \
    ./geonode/templates/ | while read path action file; do

    # Filtrar apenas CSS, JS, HTML
    if [[ ! "$file" =~ \.(css|js|html)$ ]]; then
        continue
    fi

    echo "🔄 Detectado: $file"

    # Se for HTML, reiniciar Django
    if [[ "$file" == *.html ]]; then
        echo "   📄 HTML alterado - reiniciando Django..."
        docker compose restart django 2>&1 | grep -v "WARNING" &
        sleep 3
    else
        # CSS/JS: só collectstatic
        docker compose exec -T django python manage.py collectstatic --noinput 2>&1 | grep -E "(Copying|Deleting|static files)" || true
    fi

    # Limpar cache sempre
    docker compose exec -T django python -c "
from django.core.cache import cache
cache.clear()
print('✓ Cache limpo')
" 2>/dev/null || true

    echo "✓ $(date '+%H:%M:%S') - Atualizado! Use Ctrl+Shift+R no navegador"
    echo ""
done
