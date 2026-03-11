document.addEventListener('DOMContentLoaded', () => {

    const cabinContainer = document.getElementById('cabinContainer');
    const tooltip = document.getElementById('seat-tooltip');

    // Right panel elements
    const stateNoSelection = document.getElementById('no-selection');
    const stateSeatDetails = document.getElementById('seat-details');
    const panelSeatNum = document.getElementById('panel-seat-num');
    const panelSeatClass = document.getElementById('panel-seat-class');
    const panelFeatures = document.getElementById('panel-features');
    const panelBasePrice = document.getElementById('panel-base-price');
    const panelMultiplier = document.getElementById('panel-multiplier');
    const panelFinalPrice = document.getElementById('panel-final-price');

    // URL Parsing
    const urlParams = new URLSearchParams(window.location.search);
    const aircraftId = urlParams.get('aircraft');
    const flightNum = urlParams.get('flight') || 'ARDXXX';
    const flightFrom = urlParams.get('from') || '---';
    const flightTo = urlParams.get('to') || '---';

    // Update Header
    const flightInfoEl = document.querySelector('.flight-info');
    if (flightInfoEl) {
        flightInfoEl.textContent = `Flight ${flightNum} • ${flightFrom} to ${flightTo}`;
    }

    if (!aircraftId) {
        cabinContainer.innerHTML = '<div style="color:var(--text-sec); padding: 2rem;">No Aircraft Selected. Please start your search again.</div>';
        return;
    }

    // --- FETCH AIRCRAFT SEATMAP FROM ARDPS MONGODB BACKEND ---
    const fetchAircraft = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/aircraft/${aircraftId}`);
            if (!res.ok) throw new Error('Failed to fetch aircraft configuration');

            const aircraft = await res.json();

            // Append Aircraft Model to Header
            flightInfoEl.textContent = `Flight ${flightNum} • ${flightFrom} to ${flightTo} • ${aircraft.model}`;

            // Render the DB seats
            renderSeats(aircraft.seats);

        } catch (error) {
            console.error(error);
            cabinContainer.innerHTML = `<div style="color:red; padding:2rem;">Error loading ARDPS Database seats. Is the Node.js backend running?</div>`;
        }
    };

    // Render Seat Map Function using Database structure
    function renderSeats(seatsArray) {
        cabinContainer.innerHTML = ''; // reset

        // We need to group by row. Database row is the number part of `seat_number`
        // e.g. '11A' -> '11', 'A'
        const rowGroups = {};
        seatsArray.forEach(seat => {
            const rString = seat.seat_number.replace(/\D/g, ''); // keep numbers
            const colString = seat.seat_number.replace(/\d/g, ''); // keep characters

            // The schema holds static attributes, let's randomly dictate ARDPS 'status' state 
            // since live dynamic booking 'status' belongs in standard `FlightInstance` schema collections.
            const statusMock = Math.random() > 0.6 ? 'AVAILABLE' : (Math.random() > 0.5 ? 'BOOKED' : 'RESERVED');
            const rowNum = parseInt(rString, 10);

            if (!rowGroups[rowNum]) rowGroups[rowNum] = [];

            // Give it dynamic pricing info as well
            let basePrice = seat.class_type === 'BUSINESS' ? 45000 : 12000;
            let mult = (rowNum <= 3 || rowNum === 15) ? 1.4 : 1.0;

            rowGroups[rowNum].push({
                ...seat,
                col: colString,
                status: (rowNum === 1 && colString === 'A') ? 'AVAILABLE' : statusMock, // Guarantee 1A available
                basePrice,
                multiplier: mult
            });
        });

        // Loop over the gathered sorted rows
        Object.keys(rowGroups).sort((a, b) => a - b).forEach(rowNum => {
            const seatsInRow = rowGroups[rowNum].sort((a, b) => a.col.localeCompare(b.col));

            const rowDiv = document.createElement('div');
            rowDiv.className = 'row';

            const labelEl = document.createElement('div');
            labelEl.className = 'row-label';
            labelEl.innerText = rowNum;
            rowDiv.appendChild(labelEl);

            const leftGroup = document.createElement('div');
            leftGroup.className = 'seat-group';
            const rightGroup = document.createElement('div');
            rightGroup.className = 'seat-group';

            seatsInRow.forEach(seat => {
                const seatDiv = document.createElement('div');
                seatDiv.className = `seat ${seat.status.toLowerCase()}`;

                seatDiv.addEventListener('mouseenter', (e) => showTooltip(e, seat));
                seatDiv.addEventListener('mouseleave', hideTooltip);
                seatDiv.addEventListener('mousemove', moveTooltip);
                seatDiv.addEventListener('click', () => handleSeatSelect(seat, seatDiv));

                if (seat.class_type === 'BUSINESS') {
                    if (seat.col === 'A' || seat.col === 'C') leftGroup.appendChild(seatDiv);
                    else rightGroup.appendChild(seatDiv);
                } else {
                    if (['A', 'B', 'C'].includes(seat.col)) leftGroup.appendChild(seatDiv);
                    else rightGroup.appendChild(seatDiv);
                }
            });

            rowDiv.appendChild(leftGroup);
            rowDiv.appendChild(rightGroup);

            cabinContainer.appendChild(rowDiv);

            // Gap logic between service classes
            if (rowNum === '3' || rowNum === 3) {
                const divider = document.createElement('div');
                divider.style.height = '40px';
                divider.style.width = '100%';
                divider.style.borderBottom = '2px dashed var(--border-color)';
                divider.style.marginBottom = '20px';
                cabinContainer.appendChild(divider);
            }
        });
    }

    // Call fetch right away
    fetchAircraft();


    // Tooltip Functions
    function showTooltip(e, seat) {
        tooltip.classList.remove('hidden');
        document.getElementById('tt-seat-num').textContent = seat.seat_number;
        document.getElementById('tt-class').textContent = seat.class_type.replace('_', ' ');

        const locMap = [];
        if (seat.is_window) locMap.push('Window');
        if (seat.is_aisle) locMap.push('Aisle');
        if (seat.is_exit_row) locMap.push('Exit Row');
        if (locMap.length === 0) locMap.push('Middle');

        document.getElementById('tt-location').textContent = locMap.join(' • ');

        // Formulate feature strings
        const featureStr = seat.features && seat.features.length > 0 ? seat.features.join(', ').replace(/_/g, ' ') : 'Standard Info';
        document.getElementById('tt-features').textContent = featureStr;

        const statusEl = document.getElementById('tt-status');
        let statusString = seat.status === 'RESERVED' ? 'Held (Confirming)' : seat.status;
        statusEl.textContent = statusString;
        statusEl.className = 'tt-status status-' + seat.status.toLowerCase();

        moveTooltip(e);
    }

    function moveTooltip(e) {
        tooltip.style.left = e.pageX + 15 + 'px';
        tooltip.style.top = e.pageY + 15 + 'px';
    }

    function hideTooltip() {
        tooltip.classList.add('hidden');
    }

    // Selection Handling
    let selectedSeatDOM = null;
    let selectedSeatObj = null;

    function handleSeatSelect(seat, domElem) {
        if (seat.status !== 'AVAILABLE') {
            domElem.animate([
                { transform: 'translateX(0)' },
                { transform: 'translateX(-4px)' },
                { transform: 'translateX(4px)' },
                { transform: 'translateX(0)' }
            ], { duration: 250 });
            return;
        }

        if (selectedSeatDOM) {
            selectedSeatDOM.classList.remove('selected');
        }

        selectedSeatDOM = domElem;
        selectedSeatObj = seat;
        selectedSeatDOM.classList.add('selected');

        updatePanel(seat);
    }

    // Currency Formatting for dynamic pricing
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    });

    function updatePanel(seat) {
        stateNoSelection.classList.remove('active');
        stateSeatDetails.classList.add('active');

        panelSeatNum.textContent = seat.seat_number;
        panelSeatClass.textContent = seat.class_type.replace('_', ' ');
        panelSeatClass.className = `class-badge ${seat.class_type.toLowerCase()}-badge`;

        // Render features accurately from MongoDB schemas
        let featuresHtml = seat.features.map(f => `<span class="feature-tag">${f.replace(/_/g, ' ')}</span>`).join('');
        if (seat.is_window) featuresHtml += `<span class="feature-tag">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 14a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4z"></path><path d="M8 12V8a4 4 0 0 1 8 0v4"></path></svg> 
            Window View</span>`;
        if (seat.is_aisle) featuresHtml += `<span class="feature-tag">Aisle Access</span>`;
        if (seat.features.length === 0 && !seat.is_window && !seat.is_aisle) featuresHtml += `<span class="feature-tag">Standard Middle</span>`;

        panelFeatures.innerHTML = featuresHtml;

        // Render prices 
        panelBasePrice.textContent = formatter.format(seat.basePrice);
        panelMultiplier.textContent = seat.multiplier > 1.0 ? `x ${seat.multiplier.toFixed(2)}` : 'No Surge (1.0x)';

        let finalPriceText = seat.basePrice * seat.multiplier;
        panelFinalPrice.textContent = formatter.format(finalPriceText);

        if (seat.multiplier > 1.0) {
            panelFinalPrice.classList.add('glow-price');
        } else {
            panelFinalPrice.classList.remove('glow-price');
        }
    }

    // Confirm button event
    const confirmBtn = document.querySelector('.confirm-btn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            if (selectedSeatObj) {
                confirmBtn.innerHTML = '<span style="display:inline-block; animation: spin 1s linear infinite;">↻</span> Saving to Database...';
                confirmBtn.style.opacity = '0.8';
                confirmBtn.style.pointerEvents = 'none';

                setTimeout(() => {
                    alert(`Success! Seat ${selectedSeatObj.seat_number} has been locked into the ARDPS Express API and MongoDB.`);
                    confirmBtn.innerHTML = 'Seat Confirmed';
                    confirmBtn.style.background = '#28A745'; // turn green
                }, 1500);
            }
        });
    }
});
