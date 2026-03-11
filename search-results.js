document.addEventListener('DOMContentLoaded', () => {

    // --- NEW: Parse query parameters from URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const fromCity = urlParams.get('from') || 'MAA'; // fallback if direct link
    const toCity = urlParams.get('to') || 'DEL';
    const travelDate = urlParams.get('date');

    // Update the UI header to show the selected route
    const routeEl = document.querySelector('.route');
    if (routeEl) {
        routeEl.innerHTML = `
            <span>${fromCity.slice(0, 3).toUpperCase()}</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14m-4-4l4 4-4 4"/>
            </svg>
            <span>${toCity.slice(0, 3).toUpperCase()}</span>
        `;
    }

    const detailsEl = document.querySelector('.details');
    if (travelDate && detailsEl) {
        // Format the date nicely
        const dateObj = new Date(travelDate);
        if (!isNaN(dateObj)) {
            const formattedDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            detailsEl.innerHTML = `<span>${formattedDate}</span> • <span>1 Passenger</span> • <span>Economy</span>`;
        }
    }
    // --------------------------------------------

    const priceSlider = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');

    // Update the slider value dynamically
    if (priceSlider && priceValue) {
        priceSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            // Format to Indian Rupees roughly for UI 
            priceValue.textContent = `₹${Math.floor(val / 1000)}K`;

            // Filtering logic placeholder
            console.log("Filtering flights by max price:", val);
            // Hide flights that cost more than slider value...
            filterFlights(val);
        });
    }

    const sortSelect = document.querySelector('.sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            console.log("Sorting results by:", e.target.value);
            // Add UI sorting logic here
        });
    }

    const bookButtons = document.querySelectorAll('.book-btn');
    bookButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.innerHTML = '<span style="display:inline-block; animation: spin 1s linear infinite;">↻</span> Processing...';
            btn.style.opacity = '0.8';
            btn.style.pointerEvents = 'none';

            setTimeout(() => {
                alert("Taking you to the passenger details page...");
                btn.innerHTML = 'Select';
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'auto';
            }, 1000);
        });
    });

    const filterFlights = (maxPrice) => {
        const flightCards = document.querySelectorAll('.flight-card');
        flightCards.forEach(card => {
            const priceText = card.querySelector('.price-amount').textContent;
            // parse amount: "₹12,000" -> 12000
            const price = parseInt(priceText.replace('₹', '').replace(',', ''), 10);

            if (price > maxPrice) {
                card.style.display = 'none';
            } else {
                card.style.display = 'block';
            }
        });

        // Update results count
        const visibleCount = document.querySelectorAll('.flight-card[style="display: block;"], .flight-card:not([style*="display: none"])').length;
        const resultsCountEl = document.querySelector('.results-count');
        if (resultsCountEl) {
            resultsCountEl.textContent = `Showing ${visibleCount} flights`;
        }
    };
});
