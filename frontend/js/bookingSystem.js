// Booking System Module
let availableRooms = [];
let guests = [];

// Load booking system page
async function loadBookingSystem() {
    const contentArea = document.getElementById('pageContent');
    
    contentArea.innerHTML = `
        <div class="booking-system">
            <h2 class="page-title">
                <i class="fas fa-calendar-check"></i> Booking System
            </h2>
            
            <div class="tabs">
                <div class="tab-header">
                    <button class="tab-btn active" data-tab="newBooking">New Booking</button>
                    <button class="tab-btn" data-tab="activeBookings">Active Stays</button>
                    <button class="tab-btn" data-tab="allBookings">All Bookings</button>
                </div>
                
                <div class="tab-content">
                    <!-- New Booking Tab -->
                    <div id="newBookingTab" class="tab-pane active">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">
                                    <i class="fas fa-plus-circle"></i> Create New Booking
                                </h3>
                            </div>
                            <div class="card-body">
                                <form id="newBookingForm">
                                    <!-- Step 1: Guest Selection -->
                                    <div class="booking-step active" id="step1">
                                        <h4><i class="fas fa-user"></i> Step 1: Guest Information</h4>
                                        <div class="form-row">
                                            <div class="form-group">
                                                <label for="guestSearch">Search Existing Guest</label>
                                                <div class="search-container">
                                                    <input type="text" id="guestSearch" class="form-control" 
                                                           placeholder="Search by name or phone...">
                                                    <button type="button" class="btn btn-secondary" onclick="searchGuests()">
                                                        <i class="fas fa-search"></i>
                                                    </button>
                                                </div>
                                                <div id="guestResults" class="search-results"></div>
                                            </div>
                                            <div class="form-group">
                                                <label>Or Create New Guest</label>
                                                <button type="button" class="btn btn-outline-primary" onclick="showNewGuestForm()">
                                                    <i class="fas fa-user-plus"></i> New Guest
                                                </button>
                                            </div>
                                        </div>
                                        <div id="selectedGuestInfo" style="display: none;"></div>
                                        <div id="newGuestForm" style="display: none;">
                                            <h5>New Guest Details</h5>
                                            <div class="form-row">
                                                <div class="form-group">
                                                    <input type="text" id="newGuestFirstName" class="form-control" placeholder="First Name *">
                                                </div>
                                                <div class="form-group">
                                                    <input type="text" id="newGuestLastName" class="form-control" placeholder="Last Name *">
                                                </div>
                                            </div>
                                            <div class="form-row">
                                                <div class="form-group">
                                                    <input type="email" id="newGuestEmail" class="form-control" placeholder="Email">
                                                </div>
                                                <div class="form-group">
                                                    <input type="text" id="newGuestPhone" class="form-control" placeholder="Phone *">
                                                </div>
                                            </div>
                                            <div class="form-row">
                                                <div class="form-group">
                                                    <button type="button" class="btn btn-secondary" onclick="hideNewGuestForm()">Cancel</button>
                                                    <button type="button" class="btn btn-primary" onclick="createNewGuest()">Create Guest</button>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="step-actions">
                                            <button type="button" class="btn btn-primary" onclick="nextStep(2)">Next</button>
                                        </div>
                                    </div>
                                    
                                    <!-- Step 2: Room Selection -->
                                    <div class="booking-step" id="step2" style="display: none;">
                                        <h4><i class="fas fa-bed"></i> Step 2: Room Selection</h4>
                                        <div class="form-row">
                                            <div class="form-group">
                                                <label for="checkInDate">Check-in Date *</label>
                                                <input type="date" id="checkInDate" class="form-control" required>
                                            </div>
                                            <div class="form-group">
                                                <label for="checkOutDate">Check-out Date *</label>
                                                <input type="date" id="checkOutDate" class="form-control" required>
                                            </div>
                                            <div class="form-group">
                                                <label for="numGuests">Number of Guests *</label>
                                                <input type="number" id="numGuests" class="form-control" min="1" value="1" required>
                                            </div>
                                        </div>
                                        
                                        <div class="room-selection">
                                            <div id="availableRoomsList" class="rooms-grid">
                                                <div class="spinner"></div>
                                                <p>Loading available rooms...</p>
                                            </div>
                                        </div>
                                        
                                        <div class="step-actions">
                                            <button type="button" class="btn btn-secondary" onclick="prevStep(1)">Back</button>
                                            <button type="button" class="btn btn-primary" onclick="nextStep(3)">Next</button>
                                        </div>
                                    </div>
                                    
                                    <!-- Step 3: Booking Details -->
                                    <div class="booking-step" id="step3" style="display: none;">
                                        <h4><i class="fas fa-file-invoice"></i> Step 3: Booking Details</h4>
                                        <div id="bookingSummary"></div>
                                        
                                        <div class="form-row">
                                            <div class="form-group">
                                                <label for="specialRequests">Special Requests</label>
                                                <textarea id="specialRequests" class="form-control" rows="3" 
                                                          placeholder="Any special requests..."></textarea>
                                            </div>
                                        </div>
                                        
                                        <div class="form-row">
                                            <div class="form-group">
                                                <label for="paymentMethod">Payment Method *</label>
                                                <select id="paymentMethod" class="form-control" required>
                                                    <option value="cash">Cash</option>
                                                    <option value="credit_card">Credit Card</option>
                                                    <option value="debit_card">Debit Card</option>
                                                    <option value="online">Online Payment</option>
                                                </select>
                                            </div>
                                        </div>
                                        
                                        <div class="step-actions">
                                            <button type="button" class="btn btn-secondary" onclick="prevStep(2)">Back</button>
                                            <button type="submit" class="btn btn-success">
                                                <i class="fas fa-check"></i> Confirm Booking
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Active Bookings Tab -->
                    <div id="activeBookingsTab" class="tab-pane">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">
                                    <i class="fas fa-bed"></i> Active Stays
                                </h3>
                                <button class="btn btn-secondary" onclick="loadActiveBookings()">
                                    <i class="fas fa-redo"></i> Refresh
                                </button>
                            </div>
                            <div class="card-body">
                                <div id="activeBookingsList"></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- All Bookings Tab -->
                    <div id="allBookingsTab" class="tab-pane">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">
                                    <i class="fas fa-history"></i> All Bookings
                                </h3>
                                <div class="header-actions">
                                    <select id="bookingStatusFilter" class="form-control filter-select" onchange="filterBookings()">
                                        <option value="">All Status</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="checked_in">Checked In</option>
                                        <option value="checked_out">Checked Out</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                    <button class="btn btn-secondary" onclick="loadAllBookings()">
                                        <i class="fas fa-redo"></i> Refresh
                                    </button>
                                </div>
                            </div>
                            <div class="card-body">
                                <div id="allBookingsList"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Initialize date inputs
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    document.getElementById('checkInDate').value = today;
    document.getElementById('checkOutDate').value = tomorrowStr;
    document.getElementById('checkInDate').min = today;
    document.getElementById('checkOutDate').min = tomorrowStr;
    
    // Setup tab switching
    setupTabs();
    
    // Setup form submission
    setupBookingForm();
    
    // Load initial data
    loadAvailableRooms();
    loadActiveBookings();
    loadAllBookings();
}

// Setup tabs
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding tab pane
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === `${tabId}Tab`) {
                    pane.classList.add('active');
                }
            });
            
            // Load data for active tab
            if (tabId === 'activeBookings') {
                loadActiveBookings();
            } else if (tabId === 'allBookings') {
                loadAllBookings();
            }
        });
    });
}

// Next step in booking process
function nextStep(step) {
    // Hide all steps
    document.querySelectorAll('.booking-step').forEach(step => {
        step.style.display = 'none';
        step.classList.remove('active');
    });
    
    // Show current step
    const currentStep = document.getElementById(`step${step}`);
    currentStep.style.display = 'block';
    currentStep.classList.add('active');
    
    // Load data for step 2
    if (step === 2) {
        loadAvailableRooms();
    }
    
    // Update booking summary for step 3
    if (step === 3) {
        updateBookingSummary();
    }
}

// Previous step
function prevStep(step) {
    nextStep(step);
}

// Load available rooms
async function loadAvailableRooms() {
    try {
        const response = await fetch('/api/rooms/status/available', {
            headers: auth.getAuthHeaders()
        });
        
        if (response.ok) {
            availableRooms = await response.json();
            renderAvailableRooms();
        }
    } catch (error) {
        console.error('Error loading available rooms:', error);
        document.getElementById('availableRoomsList').innerHTML = `
            <div class="error-message">
                <p>Failed to load available rooms: ${error.message}</p>
            </div>
        `;
    }
}

// Render available rooms
function renderAvailableRooms() {
    const container = document.getElementById('availableRoomsList');
    
    if (availableRooms.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-door-closed"></i>
                <h4>No Rooms Available</h4>
                <p>There are no available rooms for the selected dates.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="rooms-grid">
            ${availableRooms.map(room => `
                <div class="room-card" data-room-id="${room.id}">
                    <div class="room-header">
                        <h4>Room ${room.room_number}</h4>
                        <span class="room-floor">Floor ${room.floor_number}</span>
                    </div>
                    <div class="room-details">
                        <div class="room-type">${room.type_name}</div>
                        <div class="room-price">SAR${room.price_per_night}/night</div>
                        <div class="room-description">${room.description || 'Standard room'}</div>
                    </div>
                    <div class="room-actions">
                        <button class="btn btn-sm btn-primary" onclick="selectRoom(${room.id})">
                            <i class="fas fa-check"></i> Select
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Select room for booking
function selectRoom(roomId) {
    const selectedRoom = availableRooms.find(room => room.id === roomId);
    if (!selectedRoom) return;
    
    // Store selected room
    window.selectedRoom = selectedRoom;
    
    // Update UI
    document.querySelectorAll('.room-card').forEach(card => {
        card.classList.remove('selected');
        if (parseInt(card.getAttribute('data-room-id')) === roomId) {
            card.classList.add('selected');
        }
    });
    
    showNotification(`Room ${selectedRoom.room_number} selected`, 'success');
}

// Update booking summary
function updateBookingSummary() {
    const checkInDate = document.getElementById('checkInDate').value;
    const checkOutDate = document.getElementById('checkOutDate').value;
    const numGuests = document.getElementById('numGuests').value;
    const selectedRoom = window.selectedRoom;
    
    if (!selectedRoom) {
        document.getElementById('bookingSummary').innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle"></i>
                Please select a room first.
            </div>
        `;
        return;
    }
    
    // Calculate nights and total
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalAmount = nights * selectedRoom.price_per_night;
    
    document.getElementById('bookingSummary').innerHTML = `
        <div class="booking-summary-card">
            <h5>Booking Summary</h5>
            <div class="summary-details">
                <div class="summary-row">
                    <span>Room:</span>
                    <span><strong>${selectedRoom.room_number} (${selectedRoom.type_name})</strong></span>
                </div>
                <div class="summary-row">
                    <span>Floor:</span>
                    <span>${selectedRoom.floor_number}</span>
                </div>
                <div class="summary-row">
                    <span>Check-in:</span>
                    <span>${new Date(checkInDate).toLocaleDateString()}</span>
                </div>
                <div class="summary-row">
                    <span>Check-out:</span>
                    <span>${new Date(checkOutDate).toLocaleDateString()}</span>
                </div>
                <div class="summary-row">
                    <span>Nights:</span>
                    <span>${nights}</span>
                </div>
                <div class="summary-row">
                    <span>Guests:</span>
                    <span>${numGuests}</span>
                </div>
                <div class="summary-row">
                    <span>Price per night:</span>
                    <span>SAR${selectedRoom.price_per_night}</span>
                </div>
                <div class="summary-row total">
                    <span>Total Amount:</span>
                    <span><strong>SAR${totalAmount.toFixed(2)}</strong></span>
                </div>
            </div>
        </div>
    `;
    
    // Store booking details
    window.bookingDetails = {
        room_id: selectedRoom.id,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        number_of_guests: parseInt(numGuests),
        total_amount: totalAmount
    };
}

// Setup booking form submission
function setupBookingForm() {
    const form = document.getElementById('newBookingForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!window.selectedGuestId && !window.newGuestCreated) {
                showNotification('Please select or create a guest first', 'error');
                return;
            }
            
            if (!window.selectedRoom) {
                showNotification('Please select a room', 'error');
                return;
            }
            
            const bookingData = {
                ...window.bookingDetails,
                guest_id: window.selectedGuestId,
                special_requests: document.getElementById('specialRequests').value || null,
                payment_method: document.getElementById('paymentMethod').value
            };
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitBtn.disabled = true;
            
            try {
                const response = await fetch('/api/bookings', {
                    method: 'POST',
                    headers: auth.getAuthHeaders(),
                    body: JSON.stringify(bookingData)
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to create booking');
                }
                
                showNotification('Booking created successfully!', 'success');
                
                // Reset form
                form.reset();
                window.selectedGuestId = null;
                window.selectedRoom = null;
                window.bookingDetails = null;
                window.newGuestCreated = false;
                
                // Reset to step 1
                nextStep(1);
                
                // Refresh bookings lists
                loadActiveBookings();
                loadAllBookings();
                
            } catch (error) {
                showNotification(`Error: ${error.message}`, 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// Search guests
async function searchGuests() {
    const searchTerm = document.getElementById('guestSearch').value;
    if (!searchTerm.trim()) return;
    
    try {
        const response = await fetch(`/api/guests/search/${encodeURIComponent(searchTerm)}`, {
            headers: auth.getAuthHeaders()
        });
        
        if (response.ok) {
            guests = await response.json();
            renderGuestResults();
        }
    } catch (error) {
        console.error('Error searching guests:', error);
    }
}

// Render guest search results
function renderGuestResults() {
    const container = document.getElementById('guestResults');
    
    if (guests.length === 0) {
        container.innerHTML = '<div class="no-results">No guests found</div>';
        return;
    }
    
    container.innerHTML = guests.map(guest => `
        <div class="guest-result" data-guest-id="${guest.id}">
            <div class="guest-name">${guest.first_name} ${guest.last_name}</div>
            <div class="guest-info">${guest.phone} • ${guest.email || 'No email'}</div>
            <button class="btn btn-sm btn-primary" onclick="selectGuest(${guest.id})">
                <i class="fas fa-check"></i> Select
            </button>
        </div>
    `).join('');
}

// Select guest
function selectGuest(guestId) {
    const guest = guests.find(g => g.id === guestId);
    if (!guest) return;
    
    window.selectedGuestId = guestId;
    window.newGuestCreated = false;
    
    document.getElementById('selectedGuestInfo').innerHTML = `
        <div class="selected-guest">
            <strong>Selected Guest:</strong> ${guest.first_name} ${guest.last_name}
            <button class="btn btn-sm btn-secondary" onclick="clearGuestSelection()">
                <i class="fas fa-times"></i> Change
            </button>
        </div>
    `;
    document.getElementById('selectedGuestInfo').style.display = 'block';
    
    // Hide search results
    document.getElementById('guestResults').innerHTML = '';
    document.getElementById('guestSearch').value = '';
}

// Clear guest selection
function clearGuestSelection() {
    window.selectedGuestId = null;
    document.getElementById('selectedGuestInfo').style.display = 'none';
}

// Show new guest form
function showNewGuestForm() {
    document.getElementById('newGuestForm').style.display = 'block';
}

// Hide new guest form
function hideNewGuestForm() {
    document.getElementById('newGuestForm').style.display = 'none';
}

// Create new guest
async function createNewGuest() {
    const firstName = document.getElementById('newGuestFirstName').value;
    const lastName = document.getElementById('newGuestLastName').value;
    const email = document.getElementById('newGuestEmail').value;
    const phone = document.getElementById('newGuestPhone').value;
    
    if (!firstName || !lastName || !phone) {
        showNotification('First name, last name, and phone are required', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/guests', {
            method: 'POST',
            headers: auth.getAuthHeaders(),
            body: JSON.stringify({
                first_name: firstName,
                last_name: lastName,
                email: email || null,
                phone: phone,
                address: null,
                government_id: null,
                id_type: null
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to create guest');
        }
        
        // Select the new guest
        window.selectedGuestId = data.id;
        window.newGuestCreated = true;
        
        document.getElementById('selectedGuestInfo').innerHTML = `
            <div class="selected-guest">
                <strong>New Guest Created:</strong> ${firstName} ${lastName}
                <button class="btn btn-sm btn-secondary" onclick="clearGuestSelection()">
                    <i class="fas fa-times"></i> Change
                </button>
            </div>
        `;
        document.getElementById('selectedGuestInfo').style.display = 'block';
        
        // Hide new guest form and clear it
        hideNewGuestForm();
        document.getElementById('newGuestFirstName').value = '';
        document.getElementById('newGuestLastName').value = '';
        document.getElementById('newGuestEmail').value = '';
        document.getElementById('newGuestPhone').value = '';
        
        showNotification('Guest created successfully!', 'success');
        
    } catch (error) {
        showNotification(`Error: ${error.message}`, 'error');
    }
}

// Load active bookings
async function loadActiveBookings() {
    try {
        const response = await fetch('/api/bookings/status/checked_in', {
            headers: auth.getAuthHeaders()
        });
        
        if (response.ok) {
            const activeBookings = await response.json();
            renderActiveBookings(activeBookings);
        }
    } catch (error) {
        console.error('Error loading active bookings:', error);
    }
}

// Render active bookings
function renderActiveBookings(bookings) {
    const container = document.getElementById('activeBookingsList');
    
    if (bookings.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bed"></i>
                <h4>No Active Stays</h4>
                <p>There are currently no active stays.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="bookings-grid">
            ${bookings.map(booking => `
                <div class="booking-card">
                    <div class="booking-header">
                        <h4>Room ${booking.room_number}</h4>
                        <span class="booking-status status-checked_in">Checked In</span>
                    </div>
                    <div class="booking-details">
                        <div class="guest-info">
                            <i class="fas fa-user"></i>
                            ${booking.first_name} ${booking.last_name}
                        </div>
                        <div class="dates">
                            <div><i class="fas fa-calendar-check"></i> Check-in: ${new Date(booking.check_in_date).toLocaleDateString()}</div>
                            <div><i class="fas fa-calendar-times"></i> Check-out: ${new Date(booking.check_out_date).toLocaleDateString()}</div>
                        </div>
                        <div class="amount">
                            <i class="fas fa-money-bill-wave"></i>
                            Total: SAR${booking.total_amount}
                        </div>
                    </div>
                    <div class="booking-actions">
                        <button class="btn btn-sm btn-success" onclick="checkOutBooking(${booking.id})">
                            <i class="fas fa-sign-out-alt"></i> Check Out
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Check out booking
async function checkOutBooking(bookingId) {
    const additionalCharges = prompt('Enter any additional charges (if any):', '0');
    if (additionalCharges === null) return;
    
    const paymentMethod = prompt('Select payment method for checkout:', 'cash');
    if (paymentMethod === null) return;
    
    try {
        const response = await fetch(`/api/bookings/${bookingId}/checkout`, {
            method: 'PUT',
            headers: auth.getAuthHeaders(),
            body: JSON.stringify({
                additional_charges: parseFloat(additionalCharges) || 0,
                payment_method: paymentMethod
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to check out');
        }
        
        showNotification('Guest checked out successfully!', 'success');
        loadActiveBookings();
        loadAllBookings();
        
    } catch (error) {
        showNotification(`Error: ${error.message}`, 'error');
    }
}

// Load all bookings
async function loadAllBookings() {
    try {
        const response = await fetch('/api/bookings', {
            headers: auth.getAuthHeaders()
        });
        
        if (response.ok) {
            const allBookings = await response.json();
            renderAllBookings(allBookings);
        }
    } catch (error) {
        console.error('Error loading all bookings:', error);
    }
}

// Render all bookings
function renderAllBookings(bookings) {
    const container = document.getElementById('allBookingsList');
    
    if (bookings.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <h4>No Bookings</h4>
                <p>No bookings have been made yet.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Booking ID</th>
                    <th>Guest</th>
                    <th>Room</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${bookings.map(booking => `
                    <tr>
                        <td>${booking.id}</td>
                        <td>${booking.first_name} ${booking.last_name}</td>
                        <td>${booking.room_number}</td>
                        <td>${new Date(booking.check_in_date).toLocaleDateString()}</td>
                        <td>${new Date(booking.check_out_date).toLocaleDateString()}</td>
                        <td>
                            <span class="status-${booking.status}">
                                ${booking.status.replace('_', ' ').toUpperCase()}
                            </span>
                        </td>
                        <td>SAR${booking.total_amount}</td>
                        <td>
                            <div class="action-buttons">
                                ${booking.status === 'confirmed' ? `
                                    <button class="btn btn-sm btn-success" onclick="checkInBooking(${booking.id})">
                                        <i class="fas fa-sign-in-alt"></i> Check In
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="cancelBooking(${booking.id})">
                                        <i class="fas fa-times"></i> Cancel
                                    </button>
                                ` : ''}
                                ${booking.status === 'checked_in' ? `
                                    <button class="btn btn-sm btn-warning" onclick="checkOutBooking(${booking.id})">
                                        <i class="fas fa-sign-out-alt"></i> Check Out
                                    </button>
                                ` : ''}
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Check in booking
async function checkInBooking(bookingId) {
    try {
        const response = await fetch(`/api/bookings/${bookingId}/checkin`, {
            method: 'PUT',
            headers: auth.getAuthHeaders()
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to check in');
        }
        
        showNotification('Guest checked in successfully!', 'success');
        loadActiveBookings();
        loadAllBookings();
        
    } catch (error) {
        showNotification(`Error: ${error.message}`, 'error');
    }
}

// Cancel booking
async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
            method: 'PUT',
            headers: auth.getAuthHeaders()
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to cancel booking');
        }
        
        showNotification('Booking cancelled successfully!', 'success');
        loadActiveBookings();
        loadAllBookings();
        
    } catch (error) {
        showNotification(`Error: ${error.message}`, 'error');
    }
}

// Filter bookings
function filterBookings() {
    // This would filter the existing bookings list
    // For now, reload with filtered data
    loadAllBookings();
}
// Load guest history page
async function loadGuestHistory() {
    const contentArea = document.getElementById('pageContent');
    
    contentArea.innerHTML = `
        <div class="guest-history">
            <h2 class="page-title">
                <i class="fas fa-history"></i> Guest History
            </h2>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-users"></i> All Guests with Booking History
                    </h3>
                    <div class="header-actions">
                        <input type="text" id="guestHistorySearch" class="form-control" 
                               placeholder="Search by name or phone..." 
                               onkeyup="searchGuestHistory()">
                        <button class="btn btn-secondary" onclick="loadGuestHistoryData()">
                            <i class="fas fa-redo"></i> Refresh
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div id="guestHistoryContainer" class="table-container">
                        <div class="spinner"></div>
                        <p>Loading guest history...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    await loadGuestHistoryData();
}

// Load guest history data
async function loadGuestHistoryData() {
    try {
        const response = await fetch('/api/guests', {
            headers: auth.getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch guests');
        }
        
        const allGuests = await response.json();
        renderGuestHistory(allGuests);
        
    } catch (error) {
        document.getElementById('guestHistoryContainer').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load guest history: ${error.message}</p>
                <button class="btn btn-primary" onclick="loadGuestHistoryData()">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

// Render guest history
function renderGuestHistory(guestsList) {
    const container = document.getElementById('guestHistoryContainer');
    
    if (guestsList.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h4>No Guests Found</h4>
                <p>No guests have been registered yet.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Guest ID</th>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Total Bookings</th>
                    <th>Last Visit</th>
                    <th>Total Spent</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${guestsList.map(guest => `
                    <tr>
                        <td>${guest.id}</td>
                        <td>
                            <strong>${guest.first_name} ${guest.last_name}</strong>
                            ${guest.government_id ? `<div class="small-text">ID: ${guest.government_id}</div>` : ''}
                        </td>
                        <td>
                            <div>${guest.phone}</div>
                            ${guest.email ? `<div class="small-text">${guest.email}</div>` : ''}
                        </td>
                        <td>
                            <span class="badge">${guest.total_bookings || 0}</span>
                        </td>
                        <td>
                            ${guest.last_visit ? new Date(guest.last_visit).toLocaleDateString() : 'Never'}
                        </td>
                        <td>
                            SAR${calculateGuestTotalSpent(guest) || '0.00'}
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-info" onclick="viewGuestDetails(${guest.id})">
                                    <i class="fas fa-eye"></i> View
                                </button>
                                <button class="btn btn-sm btn-primary" onclick="createBookingForGuest(${guest.id})">
                                    <i class="fas fa-calendar-plus"></i> New Booking
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Calculate guest total spent (placeholder function)
function calculateGuestTotalSpent(guest) {
    // This would calculate from booking history
    // For now, return placeholder
    return '0.00';
}

// Search guest history
function searchGuestHistory() {
    const searchTerm = document.getElementById('guestHistorySearch').value.toLowerCase();
    
    if (!searchTerm) {
        loadGuestHistoryData();
        return;
    }
    
    fetch('/api/guests', {
        headers: auth.getAuthHeaders()
    })
    .then(response => response.json())
    .then(guests => {
        const filteredGuests = guests.filter(guest => 
            guest.first_name.toLowerCase().includes(searchTerm) ||
            guest.last_name.toLowerCase().includes(searchTerm) ||
            guest.phone.toLowerCase().includes(searchTerm) ||
            (guest.email && guest.email.toLowerCase().includes(searchTerm))
        );
        renderGuestHistory(filteredGuests);
    });
}

// View guest details
async function viewGuestDetails(guestId) {
    try {
        const response = await fetch(`/api/guests/${guestId}`, {
            headers: auth.getAuthHeaders()
        });
        
        if (response.ok) {
            const guestDetails = await response.json();
            showGuestDetailsModal(guestDetails);
        }
    } catch (error) {
        console.error('Error loading guest details:', error);
        showNotification(`Failed to load guest details: ${error.message}`, 'error');
    }
}

// Show guest details modal
function showGuestDetailsModal(guest) {
    const modalHtml = `
        <div class="modal-overlay">
            <div class="modal" style="max-width: 700px;">
                <div class="modal-header">
                    <h3><i class="fas fa-user"></i> Guest Details: ${guest.first_name} ${guest.last_name}</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="guest-details">
                        <div class="detail-section">
                            <h4>Personal Information</h4>
                            <div class="detail-row">
                                <span class="detail-label">Full Name:</span>
                                <span class="detail-value">${guest.first_name} ${guest.last_name}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Phone:</span>
                                <span class="detail-value">${guest.phone}</span>
                            </div>
                            ${guest.email ? `
                                <div class="detail-row">
                                    <span class="detail-label">Email:</span>
                                    <span class="detail-value">${guest.email}</span>
                                </div>
                            ` : ''}
                            ${guest.address ? `
                                <div class="detail-row">
                                    <span class="detail-label">Address:</span>
                                    <span class="detail-value">${guest.address}</span>
                                </div>
                            ` : ''}
                            ${guest.government_id ? `
                                <div class="detail-row">
                                    <span class="detail-label">Government ID:</span>
                                    <span class="detail-value">${guest.government_id} (${guest.id_type || 'N/A'})</span>
                                </div>
                            ` : ''}
                        </div>
                        
                        ${guest.bookings && guest.bookings.length > 0 ? `
                            <div class="detail-section">
                                <h4>Booking History (${guest.bookings.length})</h4>
                                <div class="bookings-history">
                                    ${guest.bookings.slice(0, 5).map(booking => `
                                        <div class="booking-history-item">
                                            <div class="booking-header">
                                                <span class="booking-id">Booking #${booking.id}</span>
                                                <span class="booking-status status-${booking.status}">
                                                    ${booking.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </div>
                                            <div class="booking-details">
                                                <div>Room: ${booking.room_number}</div>
                                                <div>Check-in: ${new Date(booking.check_in_date).toLocaleDateString()}</div>
                                                <div>Check-out: ${new Date(booking.check_out_date).toLocaleDateString()}</div>
                                                <div>Amount: SAR${booking.total_amount}</div>
                                            </div>
                                        </div>
                                    `).join('')}
                                    ${guest.bookings.length > 5 ? `
                                        <div class="more-bookings">
                                            <i class="fas fa-ellipsis-h"></i>
                                            ${guest.bookings.length - 5} more bookings
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        ` : `
                            <div class="detail-section">
                                <h4>Booking History</h4>
                                <div class="no-bookings">
                                    <i class="fas fa-calendar-times"></i>
                                    <p>No bookings yet</p>
                                </div>
                            </div>
                        `}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal()">Close</button>
                    <button class="btn btn-primary" onclick="createBookingForGuest(${guest.id})">
                        <i class="fas fa-calendar-plus"></i> Create New Booking
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Create booking for specific guest
function createBookingForGuest(guestId) {
    // Set the guest ID and switch to booking system
    window.selectedGuestId = guestId;
    loadPage('bookingSystem');
    
    // Show notification
    showNotification('Guest selected. Please proceed with room selection.', 'success');
    
    // Close modal if open
    closeModal();
}

// Add guest history styles
if (!document.querySelector('#guest-history-styles')) {
    const style = document.createElement('style');
    style.id = 'guest-history-styles';
    style.textContent = `
        .guest-history .table-container {
            margin-top: 20px;
        }
        
        .small-text {
            font-size: 0.85rem;
            color: #6c757d;
            margin-top: 2px;
        }
        
        .badge {
            display: inline-block;
            padding: 4px 10px;
            background: #e9ecef;
            color: #495057;
            border-radius: 12px;
            font-size: 0.85rem;
            font-weight: 500;
            min-width: 30px;
            text-align: center;
        }
        
        .guest-details {
            padding: 10px;
        }
        
        .detail-section {
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 1px solid #dee2e6;
        }
        
        .detail-section:last-child {
            border-bottom: none;
        }
        
        .detail-section h4 {
            color: #2c3e50;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 2px solid #f0f0f0;
        }
        
        .detail-row {
            display: flex;
            margin-bottom: 10px;
        }
        
        .detail-label {
            width: 150px;
            font-weight: 500;
            color: #495057;
        }
        
        .detail-value {
            flex: 1;
            color: #6c757d;
        }
        
        .bookings-history {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .booking-history-item {
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        
        .booking-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .booking-id {
            font-weight: 500;
            color: #2c3e50;
        }
        
        .booking-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
            font-size: 0.9rem;
            color: #6c757d;
        }
        
        .no-bookings {
            text-align: center;
            padding: 30px;
            color: #6c757d;
        }
        
        .no-bookings i {
            font-size: 3rem;
            margin-bottom: 15px;
            opacity: 0.3;
        }
        
        .more-bookings {
            text-align: center;
            padding: 10px;
            color: #6c757d;
            font-style: italic;
        }
    `;
    document.head.appendChild(style);
}

// Add booking system styles
if (!document.querySelector('#booking-styles')) {
    const style = document.createElement('style');
    style.id = 'booking-styles';
    style.textContent = `
        .tabs {
            margin-top: 20px;
        }
        
        .tab-header {
            display: flex;
            border-bottom: 2px solid #dee2e6;
            margin-bottom: 20px;
        }
        
        .tab-btn {
            padding: 12px 24px;
            background: none;
            border: none;
            border-bottom: 3px solid transparent;
            font-weight: 500;
            color: #6c757d;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .tab-btn:hover {
            color: #495057;
        }
        
        .tab-btn.active {
            color: #667eea;
            border-bottom-color: #667eea;
        }
        
        .tab-pane {
            display: none;
        }
        
        .tab-pane.active {
            display: block;
        }
        
        .booking-step {
            padding: 20px 0;
        }
        
        .booking-step h4 {
            margin-bottom: 20px;
            color: #2c3e50;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .step-actions {
            margin-top: 30px;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
        
        .search-container {
            display: flex;
            gap: 10px;
        }
        
        .search-results {
            margin-top: 10px;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            max-height: 200px;
            overflow-y: auto;
        }
        
        .guest-result {
            padding: 10px 15px;
            border-bottom: 1px solid #dee2e6;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .guest-result:last-child {
            border-bottom: none;
        }
        
        .guest-name {
            font-weight: 500;
        }
        
        .guest-info {
            font-size: 0.9rem;
            color: #6c757d;
        }
        
        .selected-guest {
            padding: 15px;
            background: #e7f3ff;
            border-radius: 6px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .rooms-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .room-card {
            border: 2px solid #dee2e6;
            border-radius: 10px;
            padding: 20px;
            transition: all 0.3s;
        }
        
        .room-card:hover {
            border-color: #667eea;
            transform: translateY(-5px);
        }
        
        .room-card.selected {
            border-color: #28a745;
            background: #f8fff9;
        }
        
        .room-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .room-header h4 {
            margin: 0;
            color: #2c3e50;
        }
        
        .room-floor {
            background: #e9ecef;
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 0.85rem;
        }
        
        .room-type {
            color: #667eea;
            font-weight: 500;
            margin-bottom: 5px;
        }
        
        .room-price {
            font-size: 1.2rem;
            font-weight: 600;
            color: #28a745;
            margin-bottom: 10px;
        }
        
        .room-description {
            color: #6c757d;
            font-size: 0.9rem;
            margin-bottom: 15px;
        }
        
        .booking-summary-card {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
        }
        
        .booking-summary-card h5 {
            margin-bottom: 15px;
            color: #2c3e50;
        }
        
        .summary-details {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .summary-row {
            display: flex;
            justify-content: space-between;
            padding-bottom: 5px;
            border-bottom: 1px dashed #dee2e6;
        }
        
        .summary-row.total {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 2px solid #dee2e6;
            border-bottom: none;
            font-size: 1.1rem;
        }
        
        .bookings-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
        }
        
        .booking-card {
            border: 1px solid #dee2e6;
            border-radius: 10px;
            padding: 20px;
            background: white;
        }
        
        .booking-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .booking-header h4 {
            margin: 0;
            color: #2c3e50;
        }
        
        .booking-status {
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 0.85rem;
            font-weight: 500;
        }
        
        .status-checked_in {
            background: #fff3cd;
            color: #856404;
        }
        
        .booking-details {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .booking-details > div {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #495057;
        }
        
        .alert {
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
        }
        
        .alert-warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
        }
        
        .btn-outline-primary {
            background: white;
            border: 2px solid #667eea;
            color: #667eea;
        }
        
        .btn-outline-primary:hover {
            background: #667eea;
            color: white;
        }
        
        .filter-select {
            width: auto;
            min-width: 150px;
        }
        
        .header-actions {
            display: flex;
            gap: 10px;
            align-items: center;
        }
    `;
    document.head.appendChild(style);
}

// Export functions
window.searchGuests = searchGuests;
window.selectGuest = selectGuest;
window.clearGuestSelection = clearGuestSelection;
window.showNewGuestForm = showNewGuestForm;
window.hideNewGuestForm = hideNewGuestForm;
window.createNewGuest = createNewGuest;
window.selectRoom = selectRoom;
window.nextStep = nextStep;
window.prevStep = prevStep;
window.checkOutBooking = checkOutBooking;
window.checkInBooking = checkInBooking;
window.cancelBooking = cancelBooking;
window.loadActiveBookings = loadActiveBookings;
window.loadAllBookings = loadAllBookings;
window.filterBookings = filterBookings;
window.loadGuestHistory = loadGuestHistory;
window.searchGuestHistory = searchGuestHistory;
window.loadGuestHistoryData = loadGuestHistoryData;
window.viewGuestDetails = viewGuestDetails;
window.createBookingForGuest = createBookingForGuest;