document.addEventListener('DOMContentLoaded', () => {
    if (typeof initRecommendationsLibrary === 'function') {
        initRecommendationsLibrary();
    }

    if (typeof initRecommendationCards === 'function') {
        initRecommendationCards();
    }

    // Additional UI initialization can be placed here
});
