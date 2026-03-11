document.addEventListener('DOMContentLoaded', () => {
    const swapIcon = document.querySelector('.swap-icon');
    const fromInput = document.getElementById('from-input');
    const toInput = document.getElementById('to-input');
    const searchBtn = document.getElementById('searchBtn');
    const searchForm = document.getElementById('flightSearchForm');
    const loadingIndicator = document.getElementById('loadingIndicator');

    // Set today's date as default
    const dateInput = document.getElementById('date-input');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
        dateInput.min = today;
    }

    if (swapIcon) {
        swapIcon.addEventListener('click', () => {
            const temp = fromInput.value;
            fromInput.value = toInput.value;
            toInput.value = temp;

            // Add subtle animation on swap
            if (fromInput.parentElement && toInput.parentElement) {
                fromInput.parentElement.style.transform = 'scale(0.95)';
                toInput.parentElement.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    fromInput.parentElement.style.transform = 'scale(1)';
                    toInput.parentElement.style.transform = 'scale(1)';
                }, 150);
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();

            // Basic validation
            if (!fromInput.value || !toInput.value || !dateInput.value) {
                alert("Please fill in Origin, Destination, and Date to find the best dynamic pricing.");
                return;
            }

            searchForm.style.opacity = '0.5';
            searchForm.style.pointerEvents = 'none';
            loadingIndicator.classList.remove('hidden');

            // Simulate dynamic price calculation search
            setTimeout(() => {
                // Navigate to the next page instead of stopping
                window.location.href = `search-results.html?from=${encodeURIComponent(fromInput.value.toUpperCase())}&to=${encodeURIComponent(toInput.value.toUpperCase())}&date=${encodeURIComponent(dateInput.value)}`;
            }, 1200);
        });
    }
});
