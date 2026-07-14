document.addEventListener('DOMContentLoaded', () => {
    if (typeof initRecommendationsLibrary === 'function') {
        initRecommendationsLibrary();
    }

    if (typeof initRecommendationCards === 'function') {
        initRecommendationCards();
    }

    if (typeof initNosologyAdvisor === 'function') {
        initNosologyAdvisor();
    }

    if (typeof initCompulsionsToggle === 'function') {
        initCompulsionsToggle();
    }

    if (typeof initEditorToolbar === 'function') {
        initEditorToolbar();
    }

    const printButton = document.getElementById('print-result');
    if (printButton) {
        printButton.addEventListener('click', () => {
            if (typeof window.print !== 'function') {
                alert('Печать не поддерживается этим браузером.');
                return;
            }

            window.focus();
            window.print();
        });
    }

    // Additional UI initialization can be placed here
});
