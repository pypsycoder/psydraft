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

    // Additional UI initialization can be placed here
});
