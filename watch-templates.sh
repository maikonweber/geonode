#!/bin/bash
# Watch lento: HTML/Templates (COM restart Django)

echo "🔄 Monitorando Templates HTML (com restart Django)..."
echo "Ctrl+C para parar"
echo ""

# Instalar inotify se não existir
if ! command -v inotifywait &> /dev/null; then
    echo "Instalando inotify-tools..."
    sudo apt-get install -y inotify-tools
fi

# Monitorar templates/ e arquivos Python
inotifywait -m -r -e close_write,moved_to \
    --exclude '(__pycache__|\.pyc|\.git|\.swp|~|\.mo$)' \
    ./catalogue_custom/templates/ \
    ./home_custom/templates/ \
    ./geonode/templates/ \
    ./catalogue_custom/*.py \
    ./home_custom/*.py | while read path action file; do

    # Filtrar apenas HTML e Python
    if [[ ! "$file" =~ \.(html|py)$ ]]; then
        continue
    fi

    echo "🔄 $file"
    echo "   Reiniciando Django (~5s)..."

    # Restart Django silencioso
    docker compose restart django >/dev/null 2>&1 &
    sleep 5

    # Limpar cache
    docker compose exec -T django python -c "from django.core.cache import cache; cache.clear()" 2>/dev/null

    echo "   ✓ $(date '+%H:%M:%S') - Use Ctrl+Shift+R"
    echo ""
done
