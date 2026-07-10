// ==================================
// CARROUSEL COM TOUCH E AUTO-PLAY
// ==================================

class Carousel {
    constructor(trackId) {
        this.track = document.getElementById(trackId);
        this.currentPosition = 0;
        this.cardWidth = 345; // 320px card + 25px gap
        this.autoPlayInterval = null;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.isDragging = false;

        this.init();
    }

    init() {
        // Touch events para mobile
        this.track.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        this.track.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: true });
        this.track.addEventListener('touchend', (e) => this.handleTouchEnd(e));

        // Mouse drag events para desktop
        this.track.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.track.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.track.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.track.addEventListener('mouseleave', (e) => this.handleMouseLeave(e));

        // Auto-play (opcional - descomente para ativar)
        // this.startAutoPlay();
    }

    scroll(direction) {
        const maxScroll = -(this.track.children.length - 4) * this.cardWidth;
        this.currentPosition -= direction * this.cardWidth * 2;

        if (this.currentPosition > 0) {
            this.currentPosition = 0;
        } else if (this.currentPosition < maxScroll) {
            this.currentPosition = maxScroll;
        }

        this.track.style.transform = `translateX(${this.currentPosition}px)`;
    }

    // Recalcula posição após remoção de card
    adjustAfterRemoval() {
        const maxScroll = -(this.track.children.length - 4) * this.cardWidth;

        // Se a posição atual está além do novo limite, ajusta
        if (this.currentPosition < maxScroll) {
            this.currentPosition = maxScroll;
        }

        this.track.style.transform = `translateX(${this.currentPosition}px)`;
    }

    // Touch Events
    handleTouchStart(e) {
        this.touchStartX = e.changedTouches[0].screenX;
    }

    handleTouchMove(e) {
        this.touchEndX = e.changedTouches[0].screenX;
    }

    handleTouchEnd(e) {
        const diffX = this.touchStartX - this.touchEndX;

        if (Math.abs(diffX) > 50) { // Mínimo 50px para swipe
            if (diffX > 0) {
                this.scroll(1); // Swipe left -> scroll right
            } else {
                this.scroll(-1); // Swipe right -> scroll left
            }
        }
    }

    // Mouse Drag Events
    handleMouseDown(e) {
        // Ignora drag se clicar em botões ou links
        if (e.target.closest('button') || e.target.closest('a')) {
            return;
        }

        this.isDragging = true;
        this.touchStartX = e.pageX;
        this.track.style.cursor = 'grabbing';
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;
        this.touchEndX = e.pageX;
    }

    handleMouseUp(e) {
        if (!this.isDragging) return;

        this.isDragging = false;
        this.track.style.cursor = 'grab';

        const diffX = this.touchStartX - this.touchEndX;

        if (Math.abs(diffX) > 50) {
            if (diffX > 0) {
                this.scroll(1);
            } else {
                this.scroll(-1);
            }
        }
    }

    handleMouseLeave(e) {
        if (this.isDragging) {
            this.isDragging = false;
            this.track.style.cursor = 'grab';
        }
    }

    // Auto-play (opcional)
    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            const maxScroll = -(this.track.children.length - 4) * this.cardWidth;

            // Se chegou no final, volta ao início
            if (this.currentPosition <= maxScroll) {
                this.currentPosition = 0;
            } else {
                // Avança uma posição
                this.currentPosition -= this.cardWidth;
            }

            this.track.style.transform = `translateX(${this.currentPosition}px)`;
        }, 3000); // Muda a cada 3 segundos
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
}

// Inicializar carousel quando DOM carregar
let carousel;

document.addEventListener('DOMContentLoaded', function () {
    const carouselTrack = document.getElementById('carouselTrack');
    if (carouselTrack) {
        carousel = new Carousel('carouselTrack');
    }
});

// Função global para os botões HTML
function scrollCarousel(direction) {
    if (carousel) {
        carousel.scroll(direction);
    }
}

// ==================================
// DROPDOWN DO USUÁRIO
// ==================================

document.addEventListener('DOMContentLoaded', function () {
    const userButton = document.getElementById('userMenuButton');
    const userDropdown = document.getElementById('userMenuDropdown');

    if (userButton && userDropdown) {
        userButton.addEventListener('click', function (e) {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });

        // Fechar ao clicar fora
        document.addEventListener('click', function (e) {
            if (!userButton.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });
    }
});

// ==================================
// FAVORITOS
// ==================================

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.resource-card-favorite').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const resourceId = this.dataset.resourceId;
            const icon = this.querySelector('i');
            const isFavorited = icon.classList.contains('fa-solid');

            // Endpoint do GeoNode para favoritos
            const url = `/api/v2/resources/${resourceId}/favorite`;
            const method = isFavorited ? 'DELETE' : 'POST';

            // Obter CSRF token
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value
                || getCookie('csrftoken');

            fetch(url, {
                method: method,
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin'
            })
                .then(response => {
                    if (response.ok) {
                        // Atualiza UI apenas se a requisição foi bem-sucedida
                        if (isFavorited) {
                            icon.classList.remove('fa-solid');
                            icon.classList.add('fa-regular');
                            this.style.color = 'rgba(255, 255, 255, 0.5)';
                        } else {
                            icon.classList.remove('fa-regular');
                            icon.classList.add('fa-solid');
                            this.style.color = '#ff6b6b';
                        }
                    } else {
                        console.error('Erro ao favoritar:', response.status);
                        alert('Erro ao favoritar o recurso. Você precisa estar logado.');
                    }
                })
                .catch(error => {
                    console.error('Erro na requisição:', error);
                    alert('Erro ao favoritar o recurso.');
                });
        });
    });
});

// Função auxiliar para obter CSRF token do cookie
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// ==================================
// SELETOR DE TEMA
// ==================================

document.addEventListener('DOMContentLoaded', function () {
    const themeSelector = document.getElementById('themeSelector');

    if (themeSelector) {
        // Carregar tema salvo do localStorage
        const savedTheme = localStorage.getItem('geonodeTheme') || 'theme-default';
        document.body.className = savedTheme;
        themeSelector.value = savedTheme;

        // Trocar tema ao selecionar
        themeSelector.addEventListener('change', function () {
            const newTheme = this.value;
            document.body.className = newTheme;
            localStorage.setItem('geonodeTheme', newTheme);

            // Animação de transição suave
            document.body.style.transition = 'background-color 0.5s ease';
            setTimeout(() => {
                document.body.style.transition = '';
            }, 500);
        });
    }
});

// ==================================
// SMOOTH SCROLL PARA LINKS INTERNOS
// ==================================

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Ignora links vazios (#) que são usados para ações
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// ==================================
// NAVBAR TRANSPARENTE AO SCROLLAR
// ==================================

window.addEventListener('scroll', function () {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ==================================
// NAVBAR MOBILE TOGGLE
// ==================================

document.addEventListener('DOMContentLoaded', function () {
    const navbarToggle = document.getElementById('navbarToggle');
    const navbarMenu = document.getElementById('navbarMenu');
    if (navbarToggle && navbarMenu) {
        navbarToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            navbarMenu.classList.toggle('open');
            navbarToggle.classList.toggle('active');
        });
        document.addEventListener('click', function () {
            navbarMenu.classList.remove('open');
            navbarToggle.classList.remove('active');
        });
    }
});

// ==================================
// DROPDOWN ADICIONAR RECURSO
// ==================================

document.addEventListener('DOMContentLoaded', function () {
    const btnAddResource = document.getElementById('btnAddResource');
    const addResourceMenu = document.getElementById('addResourceMenu');

    if (btnAddResource && addResourceMenu) {
        btnAddResource.addEventListener('click', function (e) {
            e.stopPropagation();
            addResourceMenu.classList.toggle('show');
        });

        document.addEventListener('click', function (e) {
            if (!btnAddResource.contains(e.target) && !addResourceMenu.contains(e.target)) {
                addResourceMenu.classList.remove('show');
            }
        });
    }
});

// ==================================
// BOTÃO FILTRAR (redireciona para página de catálogo)
// ==================================

document.addEventListener('DOMContentLoaded', function () {
    const btnFilter = document.getElementById('btnFilter');

    if (btnFilter) {
        btnFilter.addEventListener('click', function () {
            window.location.href = '/catalogue/#/search/';
        });
    }
});

// ==================================
// MENU DE AÇÕES DO CARD (⋮)
// ==================================

document.addEventListener('DOMContentLoaded', function () {
    // Toggle dropdown
    document.querySelectorAll('.resource-card-menu-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();

            const dropdown = this.nextElementSibling;
            const wasShown = dropdown.classList.contains('show');

            // Fecha todos os dropdowns
            document.querySelectorAll('.resource-card-menu-dropdown').forEach(d => {
                d.classList.remove('show');
            });

            // Abre o clicado se estava fechado
            if (!wasShown) {
                dropdown.classList.add('show');
            }
        });
    });

    // Fecha dropdowns ao clicar fora
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.resource-card-menu-wrapper')) {
            document.querySelectorAll('.resource-card-menu-dropdown').forEach(d => {
                d.classList.remove('show');
            });
        }
    });

    // Handler para excluir - abre modal customizado
    const deleteModal = document.getElementById('deleteModal');
    const deleteModalResourceTitle = document.getElementById('deleteModalResourceTitle');
    const deleteModalConfirm = document.getElementById('deleteModalConfirm');
    const deleteModalCancel = document.getElementById('deleteModalCancel');

    let pendingDeleteId = null;

    document.querySelectorAll('.resource-delete').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            pendingDeleteId = this.dataset.resourceId;
            const resourceTitle = this.dataset.resourceTitle;

            // Mostra modal
            deleteModalResourceTitle.textContent = `"${resourceTitle}"`;
            deleteModal.style.display = 'flex';
        });
    });

    // Cancelar exclusão
    deleteModalCancel.addEventListener('click', function () {
        deleteModal.style.display = 'none';
        pendingDeleteId = null;
    });

    // Fechar modal ao clicar fora
    deleteModal.addEventListener('click', function (e) {
        if (e.target === deleteModal) {
            deleteModal.style.display = 'none';
            pendingDeleteId = null;
        }
    });

    // Confirmar exclusão
    deleteModalConfirm.addEventListener('click', function () {
        if (!pendingDeleteId) return;

        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value
            || getCookie('csrftoken');

        fetch(`/api/v2/resources/${pendingDeleteId}/delete`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            credentials: 'same-origin'
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ready' || data.status === 'running') {
                    deleteModal.style.display = 'none';

                    // Remove o card do carousel
                    const cardToRemove = document.querySelector(`.resource-card [data-resource-id="${pendingDeleteId}"]`)?.closest('.resource-card');
                    if (cardToRemove) {
                        cardToRemove.style.transition = 'opacity 0.3s';
                        cardToRemove.style.opacity = '0';
                        setTimeout(() => {
                            cardToRemove.remove();
                            // Ajusta posição do carousel após remoção
                            if (carousel) {
                                carousel.adjustAfterRemoval();
                            }
                        }, 300);
                    }

                    pendingDeleteId = null;
                } else {
                    alert('Erro ao excluir o recurso.');
                }
            })
            .catch(error => {
                console.error('Erro na requisição:', error);
                alert('Erro ao excluir o recurso. Verifique suas permissões.');
            });
    });

    // Handler para clonar - abre modal customizado
    const cloneModal = document.getElementById('cloneModal');
    const cloneModalInput = document.getElementById('cloneModalInput');
    const cloneModalConfirm = document.getElementById('cloneModalConfirm');
    const cloneModalCancel = document.getElementById('cloneModalCancel');

    let pendingCloneId = null;

    document.querySelectorAll('.resource-clone').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            pendingCloneId = this.dataset.resourceId;
            const resourceTitle = this.dataset.resourceTitle;

            // Mostra modal com título sugerido
            cloneModalInput.value = `${resourceTitle} - Cópia`;
            cloneModal.style.display = 'flex';

            // Foca no input e seleciona o texto
            setTimeout(() => {
                cloneModalInput.focus();
                cloneModalInput.select();
            }, 100);
        });
    });

    // Cancelar clonagem
    cloneModalCancel.addEventListener('click', function () {
        cloneModal.style.display = 'none';
        pendingCloneId = null;
    });

    // Fechar modal ao clicar fora
    cloneModal.addEventListener('click', function (e) {
        if (e.target === cloneModal) {
            cloneModal.style.display = 'none';
            pendingCloneId = null;
        }
    });

    // Confirmar clonagem
    function executeClone() {
        if (!pendingCloneId) return;

        const newTitle = cloneModalInput.value.trim();

        if (!newTitle) {
            alert('Digite um título para a cópia.');
            return;
        }

        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value
            || getCookie('csrftoken');

        fetch(`/api/v2/resources/${pendingCloneId}/copy`, {
            method: 'PUT',
            headers: {
                'X-CSRFToken': csrfToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                defaults: { title: newTitle }
            }),
            credentials: 'same-origin'
        })
            .then(response => response.json())
            .then(data => {
                console.log('Clone API response:', data);

                if (data.status === 'ready' || data.status === 'running') {
                    cloneModal.style.display = 'none';

                    const clonedId = data.resource?.pk;

                    // Mostra aviso de thumbnail com botão de ação
                    const cloneNotice = document.createElement('div');
                    cloneNotice.innerHTML = `
                        <div style="font-weight:600;margin-bottom:6px;">Recurso clonado com sucesso!</div>
                        <div style="font-size:13px;opacity:0.9;">Abra as propriedades do clone e faça upload de uma nova thumbnail antes de editar o conteúdo.</div>
                        ${clonedId ? `<button onclick="document.getElementById('cloneNotice').remove();openCloneProperties(${clonedId})" style="margin-top:10px;background:rgba(255,255,255,0.25);border:1px solid rgba(255,255,255,0.5);color:white;padding:6px 14px;border-radius:4px;cursor:pointer;font-size:13px;">Abrir propriedades do clone</button>` : ''}
                    `;
                    cloneNotice.id = 'cloneNotice';
                    cloneNotice.style.cssText = 'position:fixed;top:20px;right:20px;background:#1a6db5;color:white;padding:16px 20px;border-radius:8px;z-index:10001;box-shadow:0 4px 12px rgba(0,0,0,0.3);max-width:320px;line-height:1.4;';
                    document.body.appendChild(cloneNotice);

                    // Remove após 10s e recarrega
                    setTimeout(() => {
                        cloneNotice.remove();
                        location.reload();
                    }, 10000);
                } else {
                    alert('Erro ao clonar o recurso.');
                }
            })
            .catch(error => {
                console.error('Erro na requisição:', error);
                alert('Erro ao clonar o recurso. Verifique suas permissões.');
            });
    }

    cloneModalConfirm.addEventListener('click', executeClone);

    // Expõe função global para o botão do aviso de clone
    window.openCloneProperties = function (resourceId) {
        openPropertiesPanel(`/api/v2/resources/${resourceId}`);
    };

    // Enter no input confirma
    cloneModalInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            executeClone();
        }
    });

    // ==================================
    // PAINEL LATERAL DE PROPRIEDADES
    // ==================================

    const propertiesPanel = document.getElementById('propertiesPanel');
    const propertiesPanelOverlay = document.getElementById('propertiesPanelOverlay');
    const propertiesPanelClose = document.getElementById('propertiesPanelClose');
    const propertiesPanelContent = document.getElementById('propertiesPanelContent');

    function openPropertiesPanel(resourceUrl) {
        propertiesPanel.classList.add('active');
        propertiesPanelOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Mostra loading
        propertiesPanelContent.innerHTML = '<div class="properties-loading">Carregando...</div>';

        // Busca dados do recurso
        fetch(resourceUrl)
            .then(response => response.json())
            .then(data => {
                renderPropertiesPanel(data.resource);
            })
            .catch(error => {
                console.error('Erro ao buscar propriedades:', error);
                propertiesPanelContent.innerHTML = '<div class="properties-loading">Erro ao carregar propriedades.</div>';
            });
    }

    function closePropertiesPanel() {
        propertiesPanel.classList.remove('active');
        propertiesPanelOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function renderPropertiesPanel(resource) {
        const thumbnailUrl = resource.thumbnail_url || '/static/geonode/img/missing_thumb.png';

        const infoItems = [
            { label: 'Título', value: resource.title },
            { label: 'Proprietário', value: resource.owner ? `<a href="/people/profile/${resource.owner.username}/">${resource.owner.username}</a>` : '-' },
            { label: 'Publicado em', value: resource.date ? new Date(resource.date).toLocaleDateString('pt-BR') : '-' },
            { label: 'Criado em', value: resource.created ? new Date(resource.created).toLocaleDateString('pt-BR') : '-' },
            { label: 'Última modificação', value: resource.last_updated ? new Date(resource.last_updated).toLocaleDateString('pt-BR') : '-' },
            { label: 'Tipo de recurso', value: resource.resource_type || resource.subtype || '-' },
            { label: 'Origem', value: resource.sourcetype || 'local' },
            { label: 'Categoria', value: resource.category?.gn_description || '-' },
            { label: 'Ponto de contato', value: resource.poc ? resource.poc.map(p => `<a href="/people/profile/${p.username}/">${p.username}</a>`).join(', ') : '-' },
            { label: 'Palavras-chave', value: resource.keywords?.map(k => k.name).join(', ') || '-' },
            { label: 'Regiões', value: resource.regions?.map(r => r.name).join(', ') || '-' },
            { label: 'Atribuição', value: resource.attribution || '-' },
            { label: 'Idioma', value: resource.language || 'eng' },
            { label: 'Informações suplementares', value: resource.supplemental_information || 'No information provided' },
            { label: 'Extensão temporal', value: resource.temporal_extent_start && resource.temporal_extent_end ? `${resource.temporal_extent_start} - ${resource.temporal_extent_end}` : '-' }
        ];

        // Determina URLs de visualização e detalhes
        const viewUrl = resource.embed_url || (resource.resource_type === 'map' ? resource.detail_url : null);
        const detailUrl = resource.detail_url;
        const showViewButton = viewUrl && resource.resource_type !== 'document';

        const actionsHtml = `
            <div class="properties-actions">
                ${showViewButton ? `<a href="${viewUrl}" class="properties-action-btn" target="_blank">
                    <span></span> Ver mapa
                </a>` : ''}
                ${detailUrl ? `<a href="${detailUrl}" class="properties-action-btn">
                    <span></span> Detalhes
                </a>` : ''}
                <button class="properties-action-btn" id="uploadThumbnailBtn" data-resource-id="${resource.pk}">
                    <span></span> Upload imagem
                </button>
                <button class="properties-action-btn danger" id="removeThumbnailBtn" data-resource-id="${resource.pk}">
                    <span></span> Remover imagem
                </button>
            </div>
            <input type="file" id="thumbnailFileInput" accept="image/*" style="display: none;">
        `;

        const infoHtml = infoItems
            .filter(item => item.value && item.value !== '-')
            .map(item => `
                <div class="properties-info-item">
                    <div class="properties-info-label">${item.label}</div>
                    <div class="properties-info-value">${item.value}</div>
                </div>
            `).join('');

        propertiesPanelContent.innerHTML = `
            <h2 class="properties-title">${resource.title}</h2>
            <img src="${thumbnailUrl}" alt="${resource.title}" class="properties-thumbnail" id="resourceThumbnail" onerror="this.src='/static/geonode/img/missing_thumb.png'">
            ${actionsHtml}
            <div class="properties-info">
                ${infoHtml}
            </div>
        `;

        // Adiciona event listeners para os botões
        setupThumbnailHandlers(resource.pk);
    }

    function setupThumbnailHandlers(resourceId) {
        const uploadBtn = document.getElementById('uploadThumbnailBtn');
        const removeBtn = document.getElementById('removeThumbnailBtn');
        const fileInput = document.getElementById('thumbnailFileInput');

        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                // Valida tipo de arquivo
                if (!file.type.startsWith('image/')) {
                    alert('Por favor, selecione uma imagem válida.');
                    return;
                }

                uploadThumbnail(resourceId, file);
            });
        }

        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                showRemoveThumbnailModal(resourceId);
            });
        }
    }

    // Modal de remoção de thumbnail
    let pendingRemoveThumbnailId = null;

    function showRemoveThumbnailModal(resourceId) {
        pendingRemoveThumbnailId = resourceId;
        const modal = document.getElementById('removeThumbnailModal');
        modal.style.display = 'flex';
    }

    const removeThumbnailModal = document.getElementById('removeThumbnailModal');
    const removeThumbnailConfirm = document.getElementById('removeThumbnailConfirm');
    const removeThumbnailCancel = document.getElementById('removeThumbnailCancel');

    removeThumbnailCancel.addEventListener('click', () => {
        removeThumbnailModal.style.display = 'none';
        pendingRemoveThumbnailId = null;
    });

    removeThumbnailModal.addEventListener('click', (e) => {
        if (e.target === removeThumbnailModal) {
            removeThumbnailModal.style.display = 'none';
            pendingRemoveThumbnailId = null;
        }
    });

    removeThumbnailConfirm.addEventListener('click', () => {
        if (pendingRemoveThumbnailId) {
            removeThumbnailModal.style.display = 'none';
            removeThumbnail(pendingRemoveThumbnailId);
            pendingRemoveThumbnailId = null;
        }
    });

    function uploadThumbnail(resourceId, file) {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || getCookie('csrftoken');

        // Mostra indicador de loading
        const thumbnail = document.getElementById('resourceThumbnail');
        if (thumbnail) {
            thumbnail.style.opacity = '0.5';
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const base64Data = e.target.result; // já inclui "data:image/...;base64,..."

            fetch(`/api/v2/resources/${resourceId}/set_thumbnail`, {
                method: 'PUT',
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ file: base64Data }),
                credentials: 'same-origin'
            })
                .then(response => response.json())
                .then(data => {
                    if (data.thumbnail_url) {
                        // Atualiza a thumbnail no painel
                        if (thumbnail) {
                            thumbnail.src = data.thumbnail_url + '?t=' + Date.now(); // Cache bust
                            thumbnail.style.opacity = '1';
                        }

                        // Atualiza a thumbnail no card do carousel
                        const card = document.querySelector(`.resource-card [data-resource-id="${resourceId}"]`)?.closest('.resource-card');
                        if (card) {
                            const cardImg = card.querySelector('.resource-card-image');
                            if (cardImg) {
                                cardImg.src = data.thumbnail_url + '?t=' + Date.now();
                            }
                        }

                        // Mostra mensagem de sucesso
                        showNotification('Thumbnail atualizada com sucesso!', 'success');

                        // Reseta o input de arquivo
                        const fileInput = document.getElementById('thumbnailFileInput');
                        if (fileInput) {
                            fileInput.value = '';
                        }
                    } else {
                        throw new Error('Resposta inválida do servidor');
                    }
                })
                .catch(error => {
                    console.error('Erro ao fazer upload da thumbnail:', error);
                    if (thumbnail) {
                        thumbnail.style.opacity = '1';
                    }
                    showNotification('Erro ao fazer upload da thumbnail.', 'error');

                    // Reseta o input de arquivo
                    const fileInput = document.getElementById('thumbnailFileInput');
                    if (fileInput) {
                        fileInput.value = '';
                    }
                });
        }; // fim reader.onload
        reader.readAsDataURL(file);
    }

    function removeThumbnail(resourceId) {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || getCookie('csrftoken');

        fetch(`/api/v2/resources/${resourceId}/delete_thumbnail`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            credentials: 'same-origin'
        })
            .then(response => response.json())
            .then(() => {
                // Atualiza para thumbnail padrão
                const thumbnail = document.getElementById('resourceThumbnail');
                if (thumbnail) {
                    thumbnail.src = '/static/geonode/img/missing_thumb.png';
                }

                // Atualiza a thumbnail no card do carousel
                const card = document.querySelector(`.resource-card [data-resource-id="${resourceId}"]`)?.closest('.resource-card');
                if (card) {
                    const cardImg = card.querySelector('.resource-card-image');
                    if (cardImg) {
                        cardImg.src = '/static/geonode/img/missing_thumb.png';
                    }
                }

                showNotification('Thumbnail removida com sucesso!', 'success');
            })
            .catch(error => {
                console.error('Erro ao remover thumbnail:', error);
                showNotification('Erro ao remover thumbnail.', 'error');
            });
    }

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 15px 25px;
            border-radius: 5px;
            z-index: 10001;
            box-shadow: 0 4px 6px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Event listeners para abrir painel
    document.addEventListener('click', function (e) {
        const propertiesBtn = e.target.closest('.resource-properties');
        if (propertiesBtn) {
            e.preventDefault();
            e.stopPropagation();
            const resourceUrl = propertiesBtn.dataset.resourceUrl;
            openPropertiesPanel(resourceUrl);
        }
    });

    // Event listeners para fechar painel
    propertiesPanelClose.addEventListener('click', closePropertiesPanel);
    propertiesPanelOverlay.addEventListener('click', closePropertiesPanel);

    // Fechar com ESC
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && propertiesPanel.classList.contains('active')) {
            closePropertiesPanel();
        }
    });
});
