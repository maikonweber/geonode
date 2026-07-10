#!/bin/bash
# Watch rápido: apenas CSS/JS (sem restart Django)

echo "⚡ Monitorando CSS/JS (rápido, sem restart)..."
echo "Ctrl+C para parar"
echo ""

# Instalar inotify se não existir
if ! command -v inotifywait &> /dev/null; then
    echo "Instalando inotify-tools..."
    sudo apt-get install -y inotify-tools
fi

# Monitorar todas as pastas static/
inotifywait -m -r -e close_write,moved_to \
    --exclude '(__pycache__|\.pyc|\.git|\.swp|~)' \
    ./geonode/static/ \
    ./catalogue_custom/static/ \
    ./home_custom/static/ | while read path action file; do

    # Filtrar apenas CSS, JS
    if [[ ! "$file" =~ \.(css|js)$ ]]; then
        continue
    fi

    echo "⚡ $file"

    # Collectstatic rápido
    docker compose exec -T django python manage.py collectstatic --noinput 2>&1 | grep -q "static file" && echo "   ✓ Copiado"

    # Limpar cache
    docker compose exec -T django python -c "from django.core.cache import cache; cache.clear()" 2>/dev/null

    echo "   ✓ $(date '+%H:%M:%S') - Use Ctrl+Shift+R"
    echo ""
done
