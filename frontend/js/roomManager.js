// Room Management Module
let rooms = [];
let roomFloors = [];  // Changed from 'floors' to avoid conflict
let roomTypes = [];

// Load room management page
async function loadRoomManagement() {
    const contentArea = document.getElementById('pageContent');
    
    contentArea.innerHTML = `
        <div class="room-management">
            <h2 class="page-title">
                <i class="fas fa-door-closed"></i> Room Management
            </h2>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-plus-circle"></i> Add New Room
                    </h3>
                </div>
                <div class="card-body">
                    <form id="addRoomForm" class="room-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="roomNumber">Room Number *</label>
                                <input type="text" id="roomNumber" class="form-control" required 
                                       placeholder="e.g., 101, 201A">
                            </div>
                            <div class="form-group">
                                <label for="roomFloor">Floor *</label>
                                <select id="roomFloor" class="form-control" required>
                                    <option value="">Select Floor</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="roomType">Room Type *</label>
                                <select id="roomType" class="form-control" required>
                                    <option value="">Select Room Type</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="roomPrice">Price Per Night (SAR) *</label>
                                <input type="number" id="roomPrice" class="form-control" 
                                       min="0" step="0.01" required>
                            </div>
                            <div class="form-group">
                                <label for="roomStatus">Status</label>
                                <select id="roomStatus" class="form-control">
                                    <option value="available">Available</option>
                                    <option value="maintenance">Under Maintenance</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="roomDescription">Description (Optional)</label>
                            <textarea id="roomDescription" class="form-control" rows="3" 
                                      placeholder="Enter room description, features, etc..."></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Add Room
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-list"></i> All Rooms
                    </h3>
                    <div class="header-actions">
                        <select id="filterFloor" class="form-control filter-select" onchange="filterRooms()">
                            <option value="">All Floors</option>
                        </select>
                        <select id="filterStatus" class="form-control filter-select" onchange="filterRooms()">
                            <option value="">All Status</option>
                            <option value="available">Available</option>
                            <option value="booked">Booked</option>
                            <option value="occupied">Occupied</option>
                            <option value="maintenance">Maintenance</option>
                        </select>
                        <select id="filterRoomType" class="form-control filter-select" onchange="filterRooms()">
                            <option value="">All Room Types</option>
                        </select>
                        <button class="btn btn-secondary" onclick="resetFilters()">
                            <i class="fas fa-times"></i> Clear Filters
                        </button>
                        <button class="btn btn-secondary" onclick="refreshRooms()">
                            <i class="fas fa-redo"></i> Refresh
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div id="roomsTableContainer" class="table-container">
                        <div class="spinner"></div>
                        <p>Loading rooms...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Load initial data
    await Promise.all([
        loadFloorsForRooms(), 
        loadRoomTypes(), 
        loadRooms()
    ]);
    
    // Setup form
    setupRoomForm();
}

// Load room status page
async function loadRoomStatus() {
    const contentArea = document.getElementById('pageContent');
    
    contentArea.innerHTML = `
        <div class="room-status">
            <h2 class="page-title">
                <i class="fas fa-eye"></i> Room Status Overview
            </h2>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-bed"></i> All Rooms Status
                    </h3>
                    <div class="header-actions">
                        <select id="statusFilter" class="form-control filter-select" onchange="filterRoomStatus()">
                            <option value="">All Status</option>
                            <option value="available">Available</option>
                            <option value="booked">Booked</option>
                            <option value="occupied">Occupied</option>
                            <option value="maintenance">Maintenance</option>
                        </select>
                        <select id="roomTypeFilter" class="form-control filter-select" onchange="filterRoomStatus()">
                            <option value="">All Room Types</option>
                        </select>
                        <button class="btn btn-secondary" onclick="resetStatusFilters()">
                            <i class="fas fa-times"></i> Clear Filters
                        </button>
                        <button class="btn btn-secondary" onclick="refreshRoomStatus()">
                            <i class="fas fa-redo"></i> Refresh
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div id="roomStatusContainer" class="status-container">
                        <div class="spinner"></div>
                        <p>Loading room status...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Load room types for the filter
    await loadRoomTypes();
    await loadRoomStatusData();
}

// Load room status data
async function loadRoomStatusData() {
    try {
        const response = await fetch('/api/rooms', {
            headers: auth.getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch rooms');
        }
        
        const allRooms = await response.json();
        renderRoomStatus(allRooms);
        
    } catch (error) {
        document.getElementById('roomStatusContainer').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load room status: ${error.message}</p>
                <button class="btn btn-primary" onclick="loadRoomStatusData()">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

// Render room status
function renderRoomStatus(roomsList) {
    const container = document.getElementById('roomStatusContainer');
    
    if (roomsList.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-door-open"></i>
                <h4>No Rooms Found</h4>
                <p>No rooms match your filters. Try clearing filters or adding rooms.</p>
            </div>
        `;
        return;
    }
    
    // Count rooms by status
    const statusCounts = {
        available: roomsList.filter(r => r.status === 'available').length,
        booked: roomsList.filter(r => r.status === 'booked').length,
        occupied: roomsList.filter(r => r.status === 'occupied').length,
        maintenance: roomsList.filter(r => r.status === 'maintenance').length
    };
    
    container.innerHTML = `
        <div class="filter-info">
            <p>Showing ${roomsList.length} room(s)</p>
        </div>
        
        <div class="status-summary">
            <div class="summary-card status-available">
                <h4>Available</h4>
                <div class="count">${statusCounts.available}</div>
                <div class="percentage">${roomsList.length > 0 ? Math.round((statusCounts.available / roomsList.length) * 100) : 0}%</div>
            </div>
            <div class="summary-card status-booked">
                <h4>Booked</h4>
                <div class="count">${statusCounts.booked}</div>
                <div class="percentage">${roomsList.length > 0 ? Math.round((statusCounts.booked / roomsList.length) * 100) : 0}%</div>
            </div>
            <div class="summary-card status-occupied">
                <h4>Occupied</h4>
                <div class="count">${statusCounts.occupied}</div>
                <div class="percentage">${roomsList.length > 0 ? Math.round((statusCounts.occupied / roomsList.length) * 100) : 0}%</div>
            </div>
            <div class="summary-card status-maintenance">
                <h4>Maintenance</h4>
                <div class="count">${statusCounts.maintenance}</div>
                <div class="percentage">${roomsList.length > 0 ? Math.round((statusCounts.maintenance / roomsList.length) * 100) : 0}%</div>
            </div>
        </div>
        
        <div class="rooms-grid">
            ${roomsList.map(room => `
                <div class="room-status-card status-${room.status}">
                    <div class="room-card-top">
                        <div class="room-header">
                            <h4 class="room-title">Room ${room.room_number || 'N/A'}</h4>
                            <span class="floor-badge">Floor ${room.floor_number || 'N/A'}</span>
                        </div>
                        <div class="room-details">
                            <div class="room-type">${room.type_name || 'N/A'}</div>
                            <div class="room-price">${room.price_per_night || 0} SAR/night</div>
                            <div class="room-status-badge status-${room.status}">
                                ${getStatusIcon(room.status)}
                                ${room.status ? room.status.charAt(0).toUpperCase() + room.status.slice(1) : 'Unknown'}
                            </div>
                        </div>
                    </div>
                    <div class="room-actions">
                        ${room.status === 'available' ? `
                            <button class="btn btn-sm btn-primary" onclick="loadPage('bookingSystem')">
                                <i class="fas fa-calendar-plus"></i> Book
                            </button>
                        ` : ''}
                        ${room.status === 'maintenance' ? `
                            <button class="btn btn-sm btn-success" onclick="changeRoomStatus(${room.id})">
                                <i class="fas fa-check"></i> Mark Available
                            </button>
                        ` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Filter room status
function filterRoomStatus() {
    const statusFilter = document.getElementById('statusFilter').value;
    const roomTypeFilter = document.getElementById('roomTypeFilter').value;
    
    // Re-fetch and filter
    fetch('/api/rooms', {
        headers: auth.getAuthHeaders()
    })
    .then(response => response.json())
    .then(allRooms => {
        let filteredRooms = allRooms;
        
        if (statusFilter) {
            filteredRooms = filteredRooms.filter(room => room.status === statusFilter);
        }
        
        if (roomTypeFilter) {
            filteredRooms = filteredRooms.filter(room => room.room_type_id == roomTypeFilter);
        }
        
        renderRoomStatus(filteredRooms);
    })
    .catch(error => {
        console.error('Error filtering room status:', error);
        showNotification('Error filtering rooms', 'error');
    });
}

// Refresh room status
async function refreshRoomStatus() {
    await loadRoomStatusData();
}

// Reset status filters
function resetStatusFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const roomTypeFilter = document.getElementById('roomTypeFilter');
    
    if (statusFilter) statusFilter.value = '';
    if (roomTypeFilter) roomTypeFilter.value = '';
    
    filterRoomStatus();
}

// Load floors for room form
async function loadFloorsForRooms() {
    try {
        const response = await fetch('/api/floors', {
            headers: auth.getAuthHeaders()
        });
        
        if (response.ok) {
            roomFloors = await response.json();
            const floorSelect = document.getElementById('roomFloor');
            const filterFloorSelect = document.getElementById('filterFloor');
            
            // Clear existing options
            if (floorSelect) floorSelect.innerHTML = '<option value="">Select Floor</option>';
            if (filterFloorSelect) filterFloorSelect.innerHTML = '<option value="">All Floors</option>';
            
            roomFloors.forEach(floor => {
                const option = `<option value="${floor.id}">Floor ${floor.floor_number}${floor.floor_name ? ` - ${floor.floor_name}` : ''}</option>`;
                if (floorSelect) floorSelect.innerHTML += option;
                if (filterFloorSelect) filterFloorSelect.innerHTML += `<option value="${floor.id}">Floor ${floor.floor_number}</option>`;
            });
        }
    } catch (error) {
        console.error('Error loading floors:', error);
        showNotification('Error loading floors', 'error');
    }
}

// Load room types
async function loadRoomTypes() {
    try {
        const response = await fetch('/api/rooms/types/available', {
            headers: auth.getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to fetch room types`);
        }
        
        roomTypes = await response.json();
        
        // 1. Populate room type dropdown in form
        const typeSelect = document.getElementById('roomType');
        if (typeSelect) {
            typeSelect.innerHTML = '<option value="">Select Room Type</option>';
            roomTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type.id;
                option.textContent = `${type.type_name} (${type.base_price} SAR)`;
                typeSelect.appendChild(option);
            });
            
            // Set default price when type is selected
            typeSelect.addEventListener('change', function() {
                const selectedType = roomTypes.find(t => t.id == this.value);
                if (selectedType) {
                    const priceInput = document.getElementById('roomPrice');
                    if (priceInput) {
                        priceInput.value = selectedType.base_price;
                    }
                }
            });
        }
        
        // 2. Populate filter in room management page
        const filterRoomTypeSelect = document.getElementById('filterRoomType');
        if (filterRoomTypeSelect) {
            filterRoomTypeSelect.innerHTML = '<option value="">All Room Types</option>';
            roomTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type.id;
                option.textContent = type.type_name;
                filterRoomTypeSelect.appendChild(option);
            });
        }
        
        // 3. Populate filter in room status page
        const roomTypeFilterSelect = document.getElementById('roomTypeFilter');
        if (roomTypeFilterSelect) {
            roomTypeFilterSelect.innerHTML = '<option value="">All Room Types</option>';
            roomTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type.id;
                option.textContent = type.type_name;
                roomTypeFilterSelect.appendChild(option);
            });
        }
        
    } catch (error) {
        console.error('Error loading room types:', error);
        showNotification(`Error loading room types: ${error.message}`, 'error');
    }
}

// Setup room form
function setupRoomForm() {
    const form = document.getElementById('addRoomForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const roomData = {
                room_number: document.getElementById('roomNumber').value.trim(),
                floor_id: document.getElementById('roomFloor').value,
                room_type_id: document.getElementById('roomType').value,
                price_per_night: parseFloat(document.getElementById('roomPrice').value) || 0,
                status: document.getElementById('roomStatus').value,
                description: document.getElementById('roomDescription').value.trim() || null
            };
            
            // Validate
            if (!roomData.room_number || !roomData.floor_id || !roomData.room_type_id || roomData.price_per_night <= 0) {
                showNotification('Please fill all required fields with valid data', 'error');
                return;
            }
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
            submitBtn.disabled = true;
            
            try {
                const response = await fetch('/api/rooms', {
                    method: 'POST',
                    headers: auth.getAuthHeaders(),
                    body: JSON.stringify(roomData)
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to add room');
                }
                
                // Reset form
                form.reset();
                showNotification('Room added successfully!', 'success');
                
                // Refresh rooms list
                await loadRooms();
                
            } catch (error) {
                showNotification(`Error: ${error.message}`, 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// Load all rooms
async function loadRooms() {
    try {
        const response = await fetch('/api/rooms', {
            headers: auth.getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch rooms');
        }
        
        rooms = await response.json();
        renderRoomsTable();
        
    } catch (error) {
        document.getElementById('roomsTableContainer').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load rooms: ${error.message}</p>
                <button class="btn btn-primary" onclick="loadRooms()">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

// Render rooms table
function renderRoomsTable(filteredRooms = null) {
    const displayRooms = filteredRooms || rooms;
    const container = document.getElementById('roomsTableContainer');
    
    if (displayRooms.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-door-open"></i>
                <h4>No Rooms Found</h4>
                <p>${filteredRooms ? 'No rooms match your filters. Try clearing filters.' : 'Add your first room using the form above.'}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="filter-info">
            <p>Showing ${displayRooms.length} of ${rooms.length} rooms</p>
        </div>
        <table class="table">
            <thead>
                <tr>
                    <th>Room #</th>
                    <th>Floor</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Price/Night</th>
                    <th>Description</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${displayRooms.map(room => `
                    <tr data-room-id="${room.id}">
                        <td><strong>${room.room_number || 'N/A'}</strong></td>
                        <td>${room.floor_number || 'N/A'}</td>
                        <td>${room.type_name || 'N/A'}</td>
                        <td>
                            <span class="status-${room.status || 'unknown'}">
                                ${getStatusIcon(room.status)} ${room.status ? room.status.charAt(0).toUpperCase() + room.status.slice(1) : 'Unknown'}
                            </span>
                        </td>
                        <td>${room.price_per_night || 0} SAR</td>
                        <td>${room.description || '-'}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-info" onclick="editRoom(${room.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-warning" onclick="changeRoomStatus(${room.id})">
                                    <i class="fas fa-exchange-alt"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteRoom(${room.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Get status icon
function getStatusIcon(status) {
    const icons = {
        available: 'fas fa-check-circle',
        booked: 'fas fa-calendar-check',
        occupied: 'fas fa-user-check',
        maintenance: 'fas fa-tools'
    };
    return `<i class="${icons[status] || 'fas fa-question-circle'}"></i>`;
}

// Filter rooms
function filterRooms() {
    const floorFilter = document.getElementById('filterFloor')?.value || '';
    const statusFilter = document.getElementById('filterStatus')?.value || '';
    const roomTypeFilter = document.getElementById('filterRoomType')?.value || '';
    
    let filteredRooms = rooms;
    
    if (floorFilter) {
        filteredRooms = filteredRooms.filter(room => room.floor_id == floorFilter);
    }
    
    if (statusFilter) {
        filteredRooms = filteredRooms.filter(room => room.status === statusFilter);
    }
    
    if (roomTypeFilter) {
        filteredRooms = filteredRooms.filter(room => room.room_type_id == roomTypeFilter);
    }
    
    renderRoomsTable(filteredRooms);
}

// Reset filters
function resetFilters() {
    const filterFloor = document.getElementById('filterFloor');
    const filterStatus = document.getElementById('filterStatus');
    const filterRoomType = document.getElementById('filterRoomType');
    
    if (filterFloor) filterFloor.value = '';
    if (filterStatus) filterStatus.value = '';
    if (filterRoomType) filterRoomType.value = '';
    
    filterRooms();
}

// Edit room
async function editRoom(roomId) {
    const room = rooms.find(r => r.id === roomId);
    if (!room) {
        showNotification('Room not found', 'error');
        return;
    }
    
    // Ensure room types and floors are loaded
    if (roomTypes.length === 0) await loadRoomTypes();
    if (roomFloors.length === 0) await loadFloorsForRooms();
    
    // Create edit modal
    const modalHtml = `
        <div class="modal-overlay">
            <div class="modal" style="max-width: 600px;">
                <div class="modal-header">
                    <h3><i class="fas fa-edit"></i> Edit Room ${room.room_number}</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="editRoomForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editRoomNumber">Room Number *</label>
                                <input type="text" id="editRoomNumber" class="form-control" 
                                       value="${room.room_number || ''}" required>
                            </div>
                            <div class="form-group">
                                <label for="editRoomFloor">Floor *</label>
                                <select id="editRoomFloor" class="form-control" required>
                                    ${roomFloors.map(floor => `
                                        <option value="${floor.id}" ${room.floor_id == floor.id ? 'selected' : ''}>
                                            Floor ${floor.floor_number}${floor.floor_name ? ` - ${floor.floor_name}` : ''}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="editRoomType">Room Type *</label>
                                <select id="editRoomType" class="form-control" required>
                                    ${roomTypes.map(type => `
                                        <option value="${type.id}" ${room.room_type_id == type.id ? 'selected' : ''}>
                                            ${type.type_name} (${type.base_price} SAR)
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editRoomPrice">Price Per Night (SAR) *</label>
                                <input type="number" id="editRoomPrice" class="form-control" 
                                       value="${room.price_per_night || 0}" min="0" step="0.01" required>
                            </div>
                            <div class="form-group">
                                <label for="editRoomStatus">Status</label>
                                <select id="editRoomStatus" class="form-control">
                                    <option value="available" ${room.status === 'available' ? 'selected' : ''}>Available</option>
                                    <option value="booked" ${room.status === 'booked' ? 'selected' : ''}>Booked</option>
                                    <option value="occupied" ${room.status === 'occupied' ? 'selected' : ''}>Occupied</option>
                                    <option value="maintenance" ${room.status === 'maintenance' ? 'selected' : ''}>Maintenance</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="editRoomDescription">Description</label>
                            <textarea id="editRoomDescription" class="form-control" rows="3">${room.description || ''}</textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="updateRoom(${roomId})">Save Changes</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Update room
async function updateRoom(roomId) {
    const roomData = {
        room_number: document.getElementById('editRoomNumber').value.trim(),
        floor_id: document.getElementById('editRoomFloor').value,
        room_type_id: document.getElementById('editRoomType').value,
        price_per_night: parseFloat(document.getElementById('editRoomPrice').value) || 0,
        status: document.getElementById('editRoomStatus').value,
        description: document.getElementById('editRoomDescription').value.trim() || null
    };
    
    try {
        const response = await fetch(`/api/rooms/${roomId}`, {
            method: 'PUT',
            headers: auth.getAuthHeaders(),
            body: JSON.stringify(roomData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to update room');
        }
        
        showNotification('Room updated successfully!', 'success');
        closeModal();
        await loadRooms();
        
    } catch (error) {
        showNotification(`Error: ${error.message}`, 'error');
    }
}

// Change room status
async function changeRoomStatus(roomId) {
    const room = rooms.find(r => r.id === roomId);
    if (!room) {
        showNotification('Room not found', 'error');
        return;
    }
    
    const currentStatus = room.status;
    let newStatus;
    
    switch(currentStatus) {
        case 'available':
            newStatus = 'maintenance';
            break;
        case 'maintenance':
            newStatus = 'available';
            break;
        case 'booked':
        case 'occupied':
            showNotification('Cannot change status of booked or occupied rooms', 'error');
            return;
        default:
            showNotification('Unknown room status', 'error');
            return;
    }
    
    if (!confirm(`Change room ${room.room_number} status from ${currentStatus} to ${newStatus}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/rooms/${roomId}`, {
            method: 'PUT',
            headers: auth.getAuthHeaders(),
            body: JSON.stringify({ status: newStatus })
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to update room status');
        }
        
        showNotification(`Room status changed to ${newStatus}`, 'success');
        await loadRooms();
        
    } catch (error) {
        showNotification(`Error: ${error.message}`, 'error');
    }
}

// Delete room
async function deleteRoom(roomId) {
    const room = rooms.find(r => r.id === roomId);
    if (!room) {
        showNotification('Room not found', 'error');
        return;
    }
    
    if (room.status === 'booked' || room.status === 'occupied') {
        showNotification('Cannot delete a room that is booked or occupied', 'error');
        return;
    }
    
    if (!confirm(`Are you sure you want to delete room ${room.room_number}? This action cannot be undone.`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/rooms/${roomId}`, {
            method: 'DELETE',
            headers: auth.getAuthHeaders()
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to delete room');
        }
        
        showNotification('Room deleted successfully!', 'success');
        await loadRooms();
        
    } catch (error) {
        showNotification(`Error: ${error.message}`, 'error');
    }
}

// Refresh rooms
async function refreshRooms() {
    await loadRooms();
}

// Export functions
window.loadRoomManagement = loadRoomManagement;
window.loadRoomStatus = loadRoomStatus;
window.filterRooms = filterRooms;
window.resetFilters = resetFilters;
window.resetStatusFilters = resetStatusFilters;
window.refreshRooms = refreshRooms;
window.editRoom = editRoom;
window.changeRoomStatus = changeRoomStatus;
window.deleteRoom = deleteRoom;
window.updateRoom = updateRoom;
window.filterRoomStatus = filterRoomStatus;
window.refreshRoomStatus = refreshRoomStatus;