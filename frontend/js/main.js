// Main Application Controller
let currentPage = 'dashboard';

// Initialize the application
function initApp() {
    console.log('Hotel Management System initialized');
    
    // Setup navigation
    setupNavigation();
    
    // Load dashboard by default
    loadPage('dashboard');
}

// Setup sidebar navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            
            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Load the page
            loadPage(page);
        });
    });
}

// Load page content dynamically
async function loadPage(pageName) {
    currentPage = pageName;
    const contentArea = document.getElementById('pageContent');
    
    // Show loading
    contentArea.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading ${pageName.replace(/([A-Z])/g, ' $1')}...</p>
        </div>
    `;
    
    // Load page content based on page name
    switch(pageName) {
        case 'dashboard':
            await loadDashboard();
            break;
        case 'floorManagement':
            await loadFloorManagement();
            break;
        case 'roomManagement':
            await loadRoomManagement();
            break;
        case 'roomStatus':
            await loadRoomStatus();
            break;
        case 'bookingSystem':
            await loadBookingSystem();
            break;
        case 'billingSystem':
            await loadBillingSystem();
            break;
        case 'guestHistory':
            await loadGuestHistory();
            break;
        case 'reports':
            await loadReports();
            break;
        default:
            contentArea.innerHTML = `
                <div class="welcome-message">
                    <h2>Page Not Found</h2>
                    <p>The requested page "${pageName}" doesn't exist.</p>
                </div>
            `;
    }
}

// Dashboard Page
async function loadDashboard() {
    try {
        // Fetch dashboard statistics
        const [floorsRes, roomsRes, bookingsRes, guestsRes] = await Promise.all([
            fetch('/api/floors', { headers: auth.getAuthHeaders() }),
            fetch('/api/rooms', { headers: auth.getAuthHeaders() }),
            fetch('/api/bookings/status/checked_in', { headers: auth.getAuthHeaders() }),
            fetch('/api/guests', { headers: auth.getAuthHeaders() })
        ]);
        
        const floors = await floorsRes.json();
        const rooms = await roomsRes.json();
        const activeBookings = await bookingsRes.json();
        const guests = await guestsRes.json();
        
        // Calculate statistics
        const availableRooms = rooms.filter(r => r.status === 'available').length;
        const bookedRooms = rooms.filter(r => r.status === 'booked').length;
        const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
        
        const contentArea = document.getElementById('pageContent');
        contentArea.innerHTML = `
            <div class="dashboard">
                <h2 class="page-title">
                    <i class="fas fa-tachometer-alt"></i> Dashboard
                </h2>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #667eea;">
                            <i class="fas fa-layer-group"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${floors.length}</h3>
                            <p>Total Floors</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #28a745;">
                            <i class="fas fa-door-closed"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${rooms.length}</h3>
                            <p>Total Rooms</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #17a2b8;">
                            <i class="fas fa-bed"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${availableRooms}</h3>
                            <p>Available Rooms</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #ffc107;">
                            <i class="fas fa-user-friends"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${activeBookings.length}</h3>
                            <p>Active Stays</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #dc3545;">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${guests.length}</h3>
                            <p>Total Guests</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #6f42c1;">
                            <i class="fas fa-money-bill-wave"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${occupiedRooms}</h3>
                            <p>Occupied Now</p>
                        </div>
                    </div>
                </div>
                
                <div class="quick-actions">
                    <h3><i class="fas fa-bolt"></i> Quick Actions</h3>
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="loadPage('floorManagement')">
                            <i class="fas fa-plus"></i> Add New Floor
                        </button>
                        <button class="btn btn-success" onclick="loadPage('roomManagement')">
                            <i class="fas fa-door-open"></i> Add New Room
                        </button>
                        <button class="btn btn-info" onclick="loadPage('bookingSystem')">
                            <i class="fas fa-calendar-plus"></i> New Booking
                        </button>
                        <button class="btn btn-warning" onclick="loadPage('roomStatus')">
                            <i class="fas fa-eye"></i> View Room Status
                        </button>
                    </div>
                </div>
                
                <div class="recent-activity">
                    <h3><i class="fas fa-history"></i> Recent Activity</h3>
                    <div class="activity-list">
                        <div class="activity-item">
                            <i class="fas fa-check-circle text-success"></i>
                            <span>System initialized successfully</span>
                            <span class="activity-time">Just now</span>
                        </div>
                        <div class="activity-item">
                            <i class="fas fa-user-check text-info"></i>
                            <span>You logged in to the system</span>
                            <span class="activity-time">Just now</span>
                        </div>
                        ${activeBookings.length > 0 ? `
                            <div class="activity-item">
                                <i class="fas fa-bed text-warning"></i>
                                <span>${activeBookings.length} active stays in progress</span>
                                <span class="activity-time">Today</span>
                            </div>
                        ` : ''}
                        ${availableRooms > 0 ? `
                            <div class="activity-item">
                                <i class="fas fa-door-open text-success"></i>
                                <span>${availableRooms} rooms available for booking</span>
                                <span class="activity-time">Updated now</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        // Add dashboard CSS
        addDashboardStyles();
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        document.getElementById('pageContent').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error Loading Dashboard</h3>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="loadDashboard()">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

// Add dashboard specific styles
function addDashboardStyles() {
    if (!document.querySelector('#dashboard-styles')) {
        const style = document.createElement('style');
        style.id = 'dashboard-styles';
        style.textContent = `
            .dashboard {
                padding: 20px;
            }
            
            .page-title {
                color: #2c3e50;
                margin-bottom: 30px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .stat-card {
                background: white;
                border-radius: 10px;
                padding: 20px;
                display: flex;
                align-items: center;
                gap: 20px;
                box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
                transition: transform 0.3s;
            }
            
            .stat-card:hover {
                transform: translateY(-5px);
            }
            
            .stat-icon {
                width: 60px;
                height: 60px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 1.5rem;
            }
            
            .stat-info h3 {
                font-size: 2rem;
                margin-bottom: 5px;
                color: #2c3e50;
            }
            
            .stat-info p {
                color: #7f8c8d;
                font-size: 0.9rem;
            }
            
            .quick-actions {
                background: white;
                border-radius: 10px;
                padding: 25px;
                margin-bottom: 30px;
                box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
            }
            
            .quick-actions h3 {
                color: #2c3e50;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .action-buttons {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
            }
            
            .recent-activity {
                background: white;
                border-radius: 10px;
                padding: 25px;
                box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
            }
            
            .recent-activity h3 {
                color: #2c3e50;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .activity-list {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .activity-item {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 8px;
                border-left: 4px solid #667eea;
            }
            
            .activity-item i {
                font-size: 1.2rem;
            }
            
            .activity-item span:first-of-type {
                flex: 1;
            }
            
            .activity-time {
                color: #7f8c8d;
                font-size: 0.9rem;
            }
            
            .error-message {
                text-align: center;
                padding: 50px 20px;
            }
            
            .error-message i {
                font-size: 3rem;
                color: #dc3545;
                margin-bottom: 20px;
            }
            
            .error-message h3 {
                color: #dc3545;
                margin-bottom: 10px;
            }
            
            .error-message p {
                color: #7f8c8d;
                margin-bottom: 20px;
            }
            
            .loading-container {
                text-align: center;
                padding: 50px;
            }
            
            .loading-container p {
                margin-top: 15px;
                color: #7f8c8d;
            }
            
            .text-success { color: #28a745; }
            .text-info { color: #17a2b8; }
            .text-warning { color: #ffc107; }
            .text-danger { color: #dc3545; }
        `;
        document.head.appendChild(style);
    }
}

// Export functions for other modules
window.loadPage = loadPage;
window.initApp = initApp;