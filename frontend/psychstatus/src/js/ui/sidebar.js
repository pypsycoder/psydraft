function toggleSidebar() {
    document.body.classList.toggle('sidebar-collapsed');
}

function initSidebar() {
    // Объединяем ссылки десктопного сайдбара и мобильного bottom-nav
    const allLinks = document.querySelectorAll('.sidebar-link, .bottom-nav-link');
    if (!allLinks.length) return;

    allLinks.forEach((link) => {
        link.addEventListener('click', () => {
            const href = link.getAttribute('href');
            // Снимаем active со всех ссылок обеих навигаций
            allLinks.forEach((l) => l.classList.remove('active'));
            // Ставим active на все ссылки с совпадающим href (десктоп + мобайл)
            allLinks.forEach((l) => {
                if (l.getAttribute('href') === href) l.classList.add('active');
            });
        });
    });
}

function initScrollSync() {
    const sidebar = document.querySelector('.sidebar');
    const sidebarNav = document.querySelector('.sidebar-nav');
    const main = document.querySelector('.main');

    if (!sidebar || !sidebarNav || !main) return;

    // При наведении на сайдбар — колесо прокручивает только его
    sidebar.addEventListener('wheel', (e) => {
        e.preventDefault();
        sidebarNav.scrollTop += e.deltaY;
    }, { passive: false });

    // При наведении на основной контент — страница скроллится нормально,
    // а сайдбар прокручивается параллельно (пропорционально)
    main.addEventListener('wheel', (e) => {
        const pageScrollable = document.documentElement.scrollHeight - window.innerHeight;
        const sidebarScrollable = sidebarNav.scrollHeight - sidebarNav.clientHeight;
        if (sidebarScrollable > 0 && pageScrollable > 0) {
            const ratio = sidebarScrollable / pageScrollable;
            sidebarNav.scrollTop += e.deltaY * ratio;
        }
    }, { passive: true });
}

document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    initScrollSync();
});
