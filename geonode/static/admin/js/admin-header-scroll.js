document.addEventListener('DOMContentLoaded', function () {
    var header = document.getElementById('header');
    if (!header) return;

    function onScroll() {
        header.classList.toggle('scrolled', window.scrollY > 60);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
});
