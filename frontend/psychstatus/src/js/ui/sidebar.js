function toggleSidebar() {
    document.body.classList.toggle('sidebar-collapsed');
}

function initSidebar() {
    const links = document.querySelectorAll('.sidebar-link');
    if (!links.length) return;

    links.forEach((link) => {
        link.addEventListener('click', () => {
            // снимаем выделение со всех
            links.forEach((l) => l.classList.remove('sidebar-link--active'));
            // ставим на кликнутый
            link.classList.add('sidebar-link--active');
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
