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

    // Restore after the legacy modules have created their dynamic form controls.
    if (window.PsyCase) PsyCase.init();
    if (window.PsyScales && typeof PsyScales.init === 'function') PsyScales.init();
    if (window.PsyScales && typeof PsyScales.initReportAdapter === 'function') PsyScales.initReportAdapter();

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

});
