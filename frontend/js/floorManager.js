// Floor Management Module
let floors = [];

// Load floor management page
async function loadFloorManagement() {
    const contentArea = document.getElementById('pageContent');
    
    contentArea.innerHTML = `
        <div class="floor-management">
            <h2 class="page-title">
                <i class="fas fa-layer-group"></i> Floor Management
            </h2>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-plus-circle"></i> Add New Floor
                    </h3>
                </div>
                <div class="card-body">
                    <form id="addFloorForm" class="floor-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="floorNumber">Floor Number *</label>
                                <input type="number" id="floorNumber" class="form-control" min="0" required>
                            </div>
                            <div class="form-group">
                                <label for="floorName">Floor Name (Optional)</label>
                                <input type="text" id="floorName" class="form-control" placeholder="e.g., Ground Floor">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="floorDescription">Description (Optional)</label>
                            <textarea id="floorDescription" class="form-control" rows="3" placeholder="Enter floor description..."></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Add Floor
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-list"></i> All Floors
                    </h3>
                    <button class="btn btn-secondary" onclick="refreshFloors()">
                        <i class="fas fa-redo"></i> Refresh
                    </button>
                </div>
                <div class="card-body">
                    <div id="floorsTableContainer" class="table-container">
                        <div class="spinner"></div>
                        <p>Loading floors...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add form handler
    setupFloorForm();
    
    // Load floors
    await loadFloors();
}

// Setup floor form submission
function setupFloorForm() {
    const form = document.getElementById('addFloorForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const floorNumber = document.getElementById('floorNumber').value;
            const floorName = document.getElementById('floorName').value;
            const floorDescription = document.getElementById('floorDescription').value;
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
            submitBtn.disabled = true;
            
            try {
                const response = await fetch('/api/floors', {
                    method: 'POST',
                    headers: auth.getAuthHeaders(),
                    body: JSON.stringify({
                        floor_number: parseInt(floorNumber),
                        floor_name: floorName || null,
                        description: floorDescription || null
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to add floor');
                }
                
                // Reset form
                form.reset();
                
                // Show success message
                showNotification('Floor added successfully!', 'success');
                
                // Refresh floors list
                await loadFloors();
                
            } catch (error) {
                showNotification(`Error: ${error.message}`, 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// Load all floors from API
async function loadFloors() {
    try {
        const response = await fetch('/api/floors', {
            headers: auth.getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch floors');
        }
        
        floors = await response.json();
        renderFloorsTable();
        
    } catch (error) {
        document.getElementById('floorsTableContainer').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load floors: ${error.message}</p>
                <button class="btn btn-primary" onclick="loadFloors()">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

async function getRoomsCountByFloor() {
    const response = await fetch('/api/rooms', {
        headers: auth.getAuthHeaders()
    });

    if (!response.ok) return {};

    const rooms = await response.json();
    
    // Count rooms grouped by floor_id
    const counts = {};
    rooms.forEach(room => {
        counts[room.floor_id] = (counts[room.floor_id] || 0) + 1;
    });

    return counts;
}


async function renderFloorsTable() {
    const container = document.getElementById('floorsTableContainer');

    if (floors.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-building"></i>
                <h4>No Floors Added Yet</h4>
                <p>Add your first floor using the form above.</p>
            </div>
        `;
        return;
    }

    // 🔥 Load room count for each floor
    const roomCounts = await getRoomsCountByFloor();

    container.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Floor #</th>
                    <th>Floor Name</th>
                    <th>Description</th>
                    <th>Rooms</th>
                    <th>Created</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="floorsTableBody">
                ${floors.map(floor => `
                    <tr data-floor-id="${floor.id}">
                        <td><strong>${floor.floor_number}</strong></td>
                        <td>${floor.floor_name || '-'}</td>
                        <td>${floor.description || '-'}</td>

                        <td>
                            <span class="badge">
                                ${roomCounts[floor.id] || 0}
                            </span>
                        </td>

                        <td>${new Date(floor.created_at).toLocaleDateString()}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-info" onclick="editFloor(${floor.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteFloor(${floor.id})">
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


// Edit floor
async function editFloor(floorId) {
    const floor = floors.find(f => f.id === floorId);
    if (!floor) return;
    
    // Create edit modal
    const modalHtml = `
        <div class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h3><i class="fas fa-edit"></i> Edit Floor</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="editFloorForm">
                        <div class="form-group">
                            <label for="editFloorNumber">Floor Number *</label>
                            <input type="number" id="editFloorNumber" class="form-control" 
                                   value="${floor.floor_number}" min="0" required>
                        </div>
                        <div class="form-group">
                            <label for="editFloorName">Floor Name</label>
                            <input type="text" id="editFloorName" class="form-control" 
                                   value="${floor.floor_name || ''}">
                        </div>
                        <div class="form-group">
                            <label for="editFloorDescription">Description</label>
                            <textarea id="editFloorDescription" class="form-control" rows="3">${floor.description || ''}</textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="updateFloor(${floorId})">Save Changes</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Update floor
async function updateFloor(floorId) {
    const floorNumber = document.getElementById('editFloorNumber').value;
    const floorName = document.getElementById('editFloorName').value;
    const floorDescription = document.getElementById('editFloorDescription').value;
    
    try {
        const response = await fetch(`/api/floors/${floorId}`, {
            method: 'PUT',
            headers: auth.getAuthHeaders(),
            body: JSON.stringify({
                floor_number: parseInt(floorNumber),
                floor_name: floorName || null,
                description: floorDescription || null
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to update floor');
        }
        
        showNotification('Floor updated successfully!', 'success');
        closeModal();
        await loadFloors();
        
    } catch (error) {
        showNotification(`Error: ${error.message}`, 'error');
    }
}

// Delete floor
async function deleteFloor(floorId) {
    if (!confirm('Are you sure you want to delete this floor? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/floors/${floorId}`, {
            method: 'DELETE',
            headers: auth.getAuthHeaders()
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete floor');
        }
        
        showNotification('Floor deleted successfully!', 'success');
        await loadFloors();
        
    } catch (error) {
        showNotification(`Error: ${error.message}`, 'error');
    }
}

// Refresh floors
async function refreshFloors() {
    await loadFloors();
}

// Close modal
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotif = document.querySelector('.notification');
    if (existingNotif) {
        existingNotif.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Add notification styles
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideIn 0.3s ease-out;
        }
        
        .notification-success {
            background: #28a745;
        }
        
        .notification-error {
            background: #dc3545;
        }
        
        .notification-info {
            background: #17a2b8;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            margin-left: 10px;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            padding: 20px;
        }
        
        .modal {
            background: white;
            border-radius: 10px;
            width: 100%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
        }
        
        .modal-header {
            padding: 20px;
            border-bottom: 1px solid #dee2e6;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-header h3 {
            margin: 0;
            color: #2c3e50;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #7f8c8d;
        }
        
        .modal-body {
            padding: 20px;
        }
        
        .modal-footer {
            padding: 20px;
            border-top: 1px solid #dee2e6;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
        
        .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: #7f8c8d;
        }
        
        .empty-state i {
            font-size: 3rem;
            margin-bottom: 15px;
            opacity: 0.5;
        }
        
        .empty-state h4 {
            margin-bottom: 10px;
            color: #495057;
        }
        
        .badge {
            display: inline-block;
            padding: 3px 8px;
            background: #e9ecef;
            color: #495057;
            border-radius: 12px;
            font-size: 0.85rem;
            font-weight: 500;
        }
        
        .btn-sm {
            padding: 5px 10px;
            font-size: 0.875rem;
        }
        
        .action-buttons {
            display: flex;
            gap: 5px;
        }
    `;
    document.head.appendChild(style);
}

// Export functions
window.refreshFloors = refreshFloors;
window.editFloor = editFloor;
window.deleteFloor = deleteFloor;
window.closeModal = closeModal;
window.updateFloor = updateFloor;