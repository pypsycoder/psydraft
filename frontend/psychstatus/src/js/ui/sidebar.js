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

document.addEventListener('DOMContentLoaded', initSidebar);
