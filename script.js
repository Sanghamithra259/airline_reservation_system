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
                searchForm.style.opacity = '1';
                searchForm.style.pointerEvents = 'auto';
                loadingIndicator.classList.add('hidden');

                alert(`Search completed! Optimal dynamic prices found for flights from ${fromInput.value} to ${toInput.value}.`);
            }, 2500);
        });
    }
});
