#!/bin/bash
# Configuração para desenvolvimento com refresh instantâneo

echo "⚙️  Configurando ambiente de desenvolvimento..."

# 1. Recriar container nginx com volume montado
echo "1. Aplicando docker-compose.override.yml..."
docker compose down geonode
docker compose up -d geonode

echo "2. Aguardando nginx iniciar..."
sleep 3

# 2. Configurar nginx para servir do código fonte
echo "3. Configurando nginx..."
docker compose exec geonode sh -c '
# Backup
cp /etc/nginx/sites-enabled/geonode.conf /etc/nginx/sites-enabled/geonode.conf.prod 2>/dev/null || true

# Criar nova config
cat > /tmp/new-static-location << "EOF"
# GeoNode - DEV MODE: serve do código fonte
location /static/ {
  root /usr/src/geonode;
  try_files /catalogue_custom/static$uri /home_custom/static$uri /geonode/static$uri @static_prod;
  expires off;
  add_header Cache-Control "no-store, no-cache, must-revalidate";
}

location @static_prod {
  root /mnt/volumes/statics;
  try_files $uri =404;
  expires off;
}
EOF

# Substituir bloco /static/
awk "
BEGIN { done=0 }
/^# GeoNode$/ && !done {
  print
  getline
  while (\$0 !~ /^location \/uploaded\//) {
    getline
  }
  while ((getline line < \"/tmp/new-static-location\") > 0) {
    print line
  }
  print \"\"
  print
  done=1
  next
}
{ print }
" /etc/nginx/sites-enabled/geonode.conf > /tmp/geonode-new.conf

cp /tmp/geonode-new.conf /etc/nginx/sites-enabled/geonode.conf

if nginx -t 2>&1 | grep -q "successful"; then
    nginx -s reload
    exit 0
else
    cp /etc/nginx/sites-enabled/geonode.conf.prod /etc/nginx/sites-enabled/geonode.conf 2>/dev/null
    exit 1
fi
'

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ============================="
    echo "✅  MODO DESENVOLVIMENTO ATIVO"
    echo "✅ ============================="
    echo ""
    echo "📝 Edite arquivos estáticos:"
    echo "   catalogue_custom/static/catalogue_custom/"
    echo "   home_custom/static/home_custom/"
    echo "   geonode/static/geonode/"
    echo ""
    echo "🔄 Mudanças aparecem com F5!"
    echo ""
    echo "Para desativar:"
    echo "   docker compose exec geonode cp /etc/nginx/sites-enabled/geonode.conf.prod /etc/nginx/sites-enabled/geonode.conf"
    echo "   docker compose exec geonode nginx -s reload"
else
    echo "❌ Erro na configuração"
    exit 1
fi
