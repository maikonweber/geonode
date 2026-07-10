// ==================================
// CAROUSEL - scroll horizontal
// ==================================

function scrollCarousel(carouselId, direction) {
    var wrapper = document.getElementById(carouselId);
    if (!wrapper) return;
    var track = wrapper.querySelector('.carousel-track');
    var cardWidth = 260 + 24; // card width + gap
    track.scrollBy({ left: direction * cardWidth * 2, behavior: 'smooth' });
}

// ==================================
// UTILITÁRIO - CSRF COOKIE
// ==================================

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// ==================================
// DROPDOWN DO USUÁRIO
// ==================================

document.addEventListener('DOMContentLoaded', function () {
    var userButton = document.getElementById('userMenuButton');
    var userDropdown = document.getElementById('userMenuDropdown');

    if (userButton && userDropdown) {
        userButton.addEventListener('click', function (e) {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });

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
    document.querySelectorAll('.resource-card-favorite').forEach(function (btn) {
        btn.addEventListener('click', async function (e) {
            e.preventDefault();
            e.stopPropagation();

            var resourceId = this.dataset.resourceId;
            if (!resourceId) {
                console.warn('[favorito] data-resource-id ausente no botão', this);
                return;
            }

            var icon = this.querySelector('i');
            var isFavorited = icon.classList.contains('fa-solid');
            var self = this;

            var url = '/api/v2/resources/' + resourceId + '/favorite';
            var method = isFavorited ? 'DELETE' : 'POST';
            var csrfToken = getCookie('csrftoken');

            try {
                var response = await fetch(url, {
                    method: method,
                    headers: {
                        'X-CSRFToken': csrfToken,
                        'Content-Type': 'application/json',
                    },
                    credentials: 'same-origin'
                });

                var data = await response.json();
                var alreadyFavorited = response.status === 400
                    && data.message === 'Resource is already in favorites';

                if (response.ok || response.status === 201 || alreadyFavorited) {
                    var shouldBeFavorited = alreadyFavorited ? true : !isFavorited;

                    if (shouldBeFavorited) {
                        icon.classList.remove('fa-regular');
                        icon.classList.add('fa-solid');
                        self.style.color = '#e05a5a';
                    } else {
                        icon.classList.remove('fa-solid');
                        icon.classList.add('fa-regular');
                        self.style.color = '';
                    }
                } else {
                    console.error('[favorito] status=' + response.status, data);
                }
            } catch (error) {
                console.error('[favorito] erro na requisição:', error);
            }
        });
    });
});
