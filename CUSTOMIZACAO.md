# Guia de Customização - GeoNode 8D Tecnologia

## Estrutura Criada

### Apps Customizados
```
geonode/
├── home_custom/          # ✅ Home customizada (funcionando)
├── datasets_custom/      # ✅ Preparado para datasets
├── maps_custom/          # ✅ Preparado para maps  
└── documents_custom/     # ✅ Preparado para documents
```

### Snippets Reutilizáveis
```
home_custom/templates/home_custom/snippets/
├── navbar.html          # Navbar customizada (reutilizável)
└── footer.html          # Footer customizado (reutilizável)
```

## Como Funciona

### 1. URLs Configuradas
**Arquivo:** `geonode/urls.py`

```python
# Datasets, Maps e Documents agora usam apps customizados
re_path(r"^datasets/", include("datasets_custom.urls")),
re_path(r"^maps/", include("maps_custom.urls")),
re_path(r"^documents/", include("documents_custom.urls")),
```

### 2. Apps Instalados
**Arquivo:** `geonode/settings.py`

```python
INSTALLED_APPS += (
    'datasets_custom',
    'maps_custom',
    'documents_custom',
)
```

### 3. Estratégia de Customização

**IMPORTANTE:** As apps customizadas atualmente apenas **repassam** as rotas originais do GeoNode:

```python
# datasets_custom/urls.py
from geonode.layers.urls import urlpatterns as layers_urlpatterns
urlpatterns = layers_urlpatterns  # Mantém funcionalidade original
```

## Próximos Passos para Customizar

### Opção 1: Customizar Templates MapStore (Recomendado)

O GeoNode usa MapStore2 (React) para `/catalogue/`, `/datasets/`, etc.
Para customizar, você precisa:

1. **Criar template override do MapStore:**
```bash
# Criar template base
touch geonode/templates/geonode-mapstore-client/app.html
```

2. **Adicionar navbar via JavaScript:**
```html
{% extends 'geonode_mapstore_client/app.html' %}

{% block extra_head %}
<link rel="stylesheet" href="{% static 'home_custom/css/home.css' %}" />
{% endblock %}

{% block extra_script %}
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Injetar navbar customizada
    const navbar = '{% include "home_custom/snippets/navbar.html" %}';
    document.body.insertAdjacentHTML('afterbegin', navbar);
});
</script>
{% endblock %}
```

### Opção 2: Criar Views Django Customizadas

Substituir completamente as páginas por templates Django:

```python
# datasets_custom/views.py
def datasets_view(request):
    datasets = ResourceBase.objects.filter(polymorphic_ctype__model='dataset')
    return render(request, 'datasets_custom/datasets.html', {
        'datasets': datasets,
    })

# datasets_custom/urls.py  
urlpatterns = [
    re_path(r'^$', views.datasets_view, name='datasets_list'),
    # Manter rotas originais para funcionalidades específicas
] + layers_urlpatterns
```

## Templates Prontos

### datasets_custom/templates/datasets_custom/datasets.html
- ✅ Template criado
- ✅ Navbar incluída
- ✅ Footer incluído
- ✅ CSS customizado

Basta descomentar a rota em `datasets_custom/urls.py` para ativar.

## Comandos Úteis

```bash
# Reiniciar aplicação
docker compose restart django

# Ver logs
docker compose logs django --tail 50 --follow

# Testar aplicação
curl -I http://localhost/
curl -I http://localhost/datasets
```

## Status Atual

- ✅ Home customizada funcionando
- ✅ Navbar/Footer como snippets reutilizáveis
- ✅ Apps customizados criados e instalados
- ✅ URLs configuradas (modo passthrough)
- ⚠️ Templates customizados criados mas não ativos

Para ativar customização completa, escolha Opção 1 ou 2 acima.
