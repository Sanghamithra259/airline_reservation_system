document.addEventListener('DOMContentLoaded', () => {

    const urlParams = new URLSearchParams(window.location.search);
    const fromCity = urlParams.get('from') || 'MAA';
    const toCity = urlParams.get('to') || 'DEL';
    const travelDate = urlParams.get('date');

    // Display selected route in header
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
        const dateObj = new Date(travelDate);
        if (!isNaN(dateObj)) {
            const formattedDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            detailsEl.innerHTML = `<span>${formattedDate}</span> • <span>1 Passenger</span> • <span>Economy / Business</span>`;
        }
    }

    // --- FETCH FROM ARDPS MONGODB BACKEND ---
    const fetchFlights = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/flights/search?from=${fromCity}&to=${toCity}&date=${travelDate || ''}`);
            const flights = await res.json();

            const list = document.getElementById('flightList');
            if (flights.length === 0) {
                list.innerHTML = `<div class="flight-card" style="text-align: center; font-weight: 500;">No flights found for this route.</div>`;
                document.querySelector('.results-count').textContent = `Showing 0 flights`;
                return;
            }

            let htmlArr = flights.map((f, i) => {
                // Introduce some UI variety to mimic dynamic states
                const isHighDemand = i % 2 !== 0;
                const cardClass = isHighDemand ? 'flight-card high-demand' : 'flight-card';
                const demandBadge = isHighDemand ? `<span class="demand-badge pulsing">High Demand</span>` : '';
                const priceClass = isHighDemand ? 'price-amount dynamic-surge' : 'price-amount';
                const seatInfo = isHighDemand ? `<span class="seats-left alert-text">Only 5 seats left</span>` : `<span class="seats-left">Plenty of seats left</span>`;
                const calculatedPrice = isHighDemand ? (f.price * 1.5) : f.price;

                return `
                <div class="${cardClass}">
                    <div class="flight-header">
                        <span class="flight-number">${f.flight_number}</span>
                        <span class="fare-class economy">Economy / Business</span>
                        ${demandBadge}
                    </div>
                    <div class="flight-details">
                        <div class="time-block">
                            <span class="time">${f.departure}</span>
                            <span class="airport">${f.origin}</span>
                        </div>
                        <div class="duration-block">
                            <span class="duration-time">${f.duration}</span>
                            <div class="line">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2" class="plane-icon">
                                    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 4-3 3-3-1-2 2 5 2 2 5 2-2-1-3 3-3 4 6z"></path>
                                </svg>
                            </div>
                            <span class="stops-info">Non-stop</span>
                        </div>
                        <div class="time-block">
                            <span class="time">${f.arrival}</span>
                            <span class="airport">${f.destination}</span>
                        </div>
                        <div class="price-block">
                            <div class="${priceClass}">₹${calculatedPrice.toLocaleString()}</div>
                            ${seatInfo}
                            <button class="book-btn" onclick="goToSeatMap('${f.aircraftId}', '${f.flight_number}', '${f.origin}', '${f.destination}')">Select</button>
                        </div>
                    </div>
                </div>`;
            });

            list.innerHTML = htmlArr.join('');
            document.querySelector('.results-count').textContent = `Showing ${flights.length} flights`;

        } catch (error) {
            console.error('Error fetching flights:', error);
            document.getElementById('flightList').innerHTML = `<div class="flight-card" style="text-align: center; color: red;">Error loading flights. Is the Node.js backend running?</div>`;
        }
    };

    fetchFlights();

    // Attach to window so onclick can see it
    window.goToSeatMap = function (aircraftId, flightNumber, origin, dest) {
        if (!aircraftId) { alert("Missing Aircraft info from backend!"); return; }
        const btn = event.target;
        btn.innerHTML = '<span style="display:inline-block; animation: spin 1s linear infinite;">↻</span> Loading...';
        btn.style.opacity = '0.8';
        btn.style.pointerEvents = 'none';

        setTimeout(() => {
            window.location.href = `seat-map.html?aircraft=${aircraftId}&flight=${flightNumber}&from=${origin}&to=${dest}`;
        }, 800);
    };

    // Filter Logic Updates
    const priceSlider = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');

    if (priceSlider && priceValue) {
        priceSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            priceValue.textContent = `₹${Math.floor(val / 1000)}K`;

            // Basic UI filtering
            document.querySelectorAll('.flight-card').forEach(card => {
                if (card.id === 'flightList') return;
                const priceText = card.querySelector('.price-amount').textContent;
                const price = parseInt(priceText.replace('₹', '').replace(/,/g, ''), 10);
                card.style.display = (price > val) ? 'none' : 'block';
            });
        });
    }
});
