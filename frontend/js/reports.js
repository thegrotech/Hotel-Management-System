// Reports Module

// Load reports page
async function loadReports() {
    const contentArea = document.getElementById('pageContent');
    
    contentArea.innerHTML = `
        <div class="reports-system">
            <h2 class="page-title">
                <i class="fas fa-chart-bar"></i> Reports & Analytics
            </h2>
            
            <div class="reports-grid">
                <!-- Revenue Report Card -->
                <div class="report-card">
                    <div class="report-header">
                        <h3><i class="fas fa-money-bill-wave"></i> Revenue Report</h3>
                    </div>
                    <div class="report-body">
                        <div class="date-filters">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="startDate">Start Date</label>
                                    <input type="date" id="startDate" class="form-control">
                                </div>
                                <div class="form-group">
                                    <label for="endDate">End Date</label>
                                    <input type="date" id="endDate" class="form-control">
                                </div>
                            </div>
                            <button class="btn btn-primary" onclick="generateRevenueReport()">
                                <i class="fas fa-chart-line"></i> Generate Report
                            </button>
                        </div>
                        <div id="revenueResults" class="report-results">
                            <div class="placeholder">
                                <i class="fas fa-chart-pie"></i>
                                <p>Generate revenue report to see statistics</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Occupancy Report Card -->
                <div class="report-card">
                    <div class="report-header">
                        <h3><i class="fas fa-bed"></i> Occupancy Report</h3>
                    </div>
                    <div class="report-body">
                        <div class="date-filters">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="occupancyStartDate">Start Date</label>
                                    <input type="date" id="occupancyStartDate" class="form-control">
                                </div>
                                <div class="form-group">
                                    <label for="occupancyEndDate">End Date</label>
                                    <input type="date" id="occupancyEndDate" class="form-control">
                                </div>
                            </div>
                            <button class="btn btn-primary" onclick="generateOccupancyReport()">
                                <i class="fas fa-chart-bar"></i> Generate Report
                            </button>
                        </div>
                        <div id="occupancyResults" class="report-results">
                            <div class="placeholder">
                                <i class="fas fa-chart-bar"></i>
                                <p>Generate occupancy report to see statistics</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Stats Card -->
                <div class="report-card full-width">
                    <div class="report-header">
                        <h3><i class="fas fa-tachometer-alt"></i> Quick Statistics</h3>
                        <button class="btn btn-secondary" onclick="loadQuickStats()">
                            <i class="fas fa-redo"></i> Refresh
                        </button>
                    </div>
                    <div class="report-body">
                        <div id="quickStats" class="stats-container">
                            <div class="spinner"></div>
                            <p>Loading statistics...</p>
                        </div>
                    </div>
                </div>
                
                <!-- Export Data Card -->
                <div class="report-card">
                    <div class="report-header">
                        <h3><i class="fas fa-file-export"></i> Export Data</h3>
                    </div>
                    <div class="report-body">
                        <div class="export-options">
                            <div class="form-group">
                                <label>Select Data to Export:</label>
                                <select id="exportDataType" class="form-control">
                                    <option value="bookings">Bookings</option>
                                    <option value="guests">Guests</option>
                                    <option value="transactions">Transactions</option>
                                    <option value="rooms">Rooms</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Export Format:</label>
                                <div class="format-options">
                                    <label class="format-option">
                                        <input type="radio" name="exportFormat" value="csv" checked>
                                        <span>CSV</span>
                                    </label>
                                    <label class="format-option">
                                        <input type="radio" name="exportFormat" value="pdf">
                                        <span>PDF</span>
                                    </label>
                                    <label class="format-option">
                                        <input type="radio" name="exportFormat" value="excel">
                                        <span>Excel</span>
                                    </label>
                                </div>
                            </div>
                            <button class="btn btn-success" onclick="exportData()">
                                <i class="fas fa-download"></i> Export Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Set default dates (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
    document.getElementById('occupancyStartDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('occupancyEndDate').value = endDate.toISOString().split('T')[0];
    
    // Load quick stats
    loadQuickStats();
}

// Generate revenue report
async function generateRevenueReport() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) {
        showNotification('Please select both start and end dates', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/billing/reports/revenue?start_date=${startDate}&end_date=${endDate}`, {
            headers: auth.getAuthHeaders()
        });
        
        if (response.ok) {
            const report = await response.json();
            renderRevenueReport(report);
        }
    } catch (error) {
        console.error('Error generating revenue report:', error);
        showNotification(`Failed to generate report: ${error.message}`, 'error');
    }
}

// Render revenue report
function renderRevenueReport(report) {
    const container = document.getElementById('revenueResults');
    
    const { transactions, summary } = report;
    
    container.innerHTML = `
        <div class="revenue-summary">
            <div class="summary-card total-revenue">
                <h4>Total Revenue</h4>
                <div class="amount">SAR${summary.total_revenue.toFixed(2)}</div>
            </div>
            <div class="summary-card booking-revenue">
                <h4>Booking Revenue</h4>
                <div class="amount">SAR${summary.booking_revenue.toFixed(2)}</div>
            </div>
            <div class="summary-card additional-revenue">
                <h4>Additional Charges</h4>
                <div class="amount">SAR${summary.additional_charges.toFixed(2)}</div>
            </div>
            <div class="summary-card refunds">
                <h4>Refunds</h4>
                <div class="amount">-SAR${summary.refunds.toFixed(2)}</div>
            </div>
        </div>
        
        <div class="revenue-details">
            <h4>Payment Methods</h4>
            <div class="payment-methods">
                ${Object.entries(summary.by_payment_method).map(([method, amount]) => `
                    <div class="payment-method">
                        <span class="method-name">${method.replace('_', ' ').toUpperCase()}</span>
                        <span class="method-amount">SAR${amount.toFixed(2)}</span>
                        <div class="progress-bar">
                            <div class="progress" style="width: ${(amount / summary.total_revenue * 100)}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        ${transactions.length > 0 ? `
            <div class="recent-transactions">
                <h4>Recent Transactions</h4>
                <div class="transactions-list">
                    ${transactions.slice(0, 5).map(transaction => `
                        <div class="transaction-item">
                            <div class="transaction-date">${new Date(transaction.date).toLocaleDateString()}</div>
                            <div class="transaction-type">${transaction.transaction_type.replace('_', ' ').toUpperCase()}</div>
                            <div class="transaction-amount">SAR${transaction.total_amount}</div>
                            <div class="transaction-count">${transaction.transaction_count} transactions</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    `;
}

// Generate occupancy report
async function generateOccupancyReport() {
    const startDate = document.getElementById('occupancyStartDate').value;
    const endDate = document.getElementById('occupancyEndDate').value;
    
    if (!startDate || !endDate) {
        showNotification('Please select both start and end dates', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/billing/reports/occupancy?start_date=${startDate}&end_date=${endDate}`, {
            headers: auth.getAuthHeaders()
        });
        
        if (response.ok) {
            const report = await response.json();
            renderOccupancyReport(report);
        }
    } catch (error) {
        console.error('Error generating occupancy report:', error);
        showNotification(`Failed to generate report: ${error.message}`, 'error');
    }
}

// Render occupancy report
function renderOccupancyReport(report) {
    const container = document.getElementById('occupancyResults');
    
    if (report.length === 0) {
        container.innerHTML = `
            <div class="empty-report">
                <i class="fas fa-bed"></i>
                <p>No occupancy data for the selected period</p>
            </div>
        `;
        return;
    }
    
    // Calculate totals
    const totalBookings = report.reduce((sum, day) => sum + (parseInt(day.bookings_count) || 0), 0);
    const totalGuests = report.reduce((sum, day) => sum + (parseInt(day.total_guests) || 0), 0);
    const avgOccupancy = totalBookings > 0 ? Math.round((totalBookings / report.length) * 100) / 100 : 0;
    
    container.innerHTML = `
        <div class="occupancy-summary">
            <div class="summary-card">
                <h4>Total Bookings</h4>
                <div class="amount">${totalBookings}</div>
            </div>
            <div class="summary-card">
                <h4>Total Guests</h4>
                <div class="amount">${totalGuests}</div>
            </div>
            <div class="summary-card">
                <h4>Avg Daily Bookings</h4>
                <div class="amount">${avgOccupancy}</div>
            </div>
            <div class="summary-card">
                <h4>Report Period</h4>
                <div class="amount">${report.length} days</div>
            </div>
        </div>
        
        <div class="occupancy-chart">
            <h4>Daily Occupancy</h4>
            <div class="chart-container">
                ${report.slice(0, 10).map(day => `
                    <div class="chart-bar-container">
                        <div class="chart-bar" style="height: ${Math.min((day.bookings_count / 10) * 100, 100)}%"></div>
                        <div class="chart-label">${new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        <div class="chart-value">${day.bookings_count}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="occupancy-details">
            <h4>Top Days by Guests</h4>
            <div class="top-days">
                ${report
                    .sort((a, b) => b.total_guests - a.total_guests)
                    .slice(0, 5)
                    .map(day => `
                        <div class="top-day">
                            <div class="day-date">${new Date(day.date).toLocaleDateString()}</div>
                            <div class="day-guests">${day.total_guests} guests</div>
                            <div class="day-bookings">${day.bookings_count} bookings</div>
                        </div>
                    `).join('')}
            </div>
        </div>
    `;
}

// Load quick statistics
async function loadQuickStats() {
    try {
        // Fetch multiple statistics in parallel
        const [floorsRes, roomsRes, bookingsRes, guestsRes, transactionsRes] = await Promise.all([
            fetch('/api/floors', { headers: auth.getAuthHeaders() }),
            fetch('/api/rooms', { headers: auth.getAuthHeaders() }),
            fetch('/api/bookings', { headers: auth.getAuthHeaders() }),
            fetch('/api/guests', { headers: auth.getAuthHeaders() }),
            fetch('/api/billing/transactions', { headers: auth.getAuthHeaders() })
        ]);
        
        const floors = await floorsRes.json();
        const rooms = await roomsRes.json();
        const allBookings = await bookingsRes.json();
        const guests = await guestsRes.json();
        const allTransactions = await transactionsRes.json();
        
        // Calculate statistics
        const today = new Date().toISOString().split('T')[0];
        const todayBookings = allBookings.filter(b => 
            b.check_in_date === today || b.check_out_date === today
        ).length;
        
        const activeBookings = allBookings.filter(b => b.status === 'checked_in').length;
        const availableRooms = rooms.filter(r => r.status === 'available').length;
        const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
        
        // Calculate today's revenue
        const todayTransactions = allTransactions.filter(t => 
            new Date(t.transaction_date).toISOString().split('T')[0] === today
        );
        const todayRevenue = todayTransactions.reduce((sum, t) => {
            if (t.transaction_type === 'refund') {
                return sum - parseFloat(t.amount);
            }
            return sum + parseFloat(t.amount);
        }, 0);
        
        const container = document.getElementById('quickStats');
        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-box">
                    <div class="stat-icon" style="background: #667eea;">
                        <i class="fas fa-layer-group"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${floors.length}</div>
                        <div class="stat-label">Total Floors</div>
                    </div>
                </div>
                
                <div class="stat-box">
                    <div class="stat-icon" style="background: #28a745;">
                        <i class="fas fa-door-closed"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${rooms.length}</div>
                        <div class="stat-label">Total Rooms</div>
                    </div>
                </div>
                
                <div class="stat-box">
                    <div class="stat-icon" style="background: #17a2b8;">
                        <i class="fas fa-bed"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${availableRooms}</div>
                        <div class="stat-label">Available Rooms</div>
                    </div>
                </div>
                
                <div class="stat-box">
                    <div class="stat-icon" style="background: #ffc107;">
                        <i class="fas fa-user-check"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${occupiedRooms}</div>
                        <div class="stat-label">Occupied Rooms</div>
                    </div>
                </div>
                
                <div class="stat-box">
                    <div class="stat-icon" style="background: #dc3545;">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${guests.length}</div>
                        <div class="stat-label">Total Guests</div>
                    </div>
                </div>
                
                <div class="stat-box">
                    <div class="stat-icon" style="background: #6f42c1;">
                        <i class="fas fa-calendar-day"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${todayBookings}</div>
                        <div class="stat-label">Today's Bookings</div>
                    </div>
                </div>
                
                <div class="stat-box">
                    <div class="stat-icon" style="background: #20c997;">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">SAR${todayRevenue.toFixed(2)}</div>
                        <div class="stat-label">Today's Revenue</div>
                    </div>
                </div>
                
                <div class="stat-box">
                    <div class="stat-icon" style="background: #fd7e14;">
                        <i class="fas fa-history"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${allBookings.length}</div>
                        <div class="stat-label">Total Bookings</div>
                    </div>
                </div>
            </div>
            
            <div class="stats-highlights">
                <h4>Performance Highlights</h4>
                <div class="highlights-list">
                    <div class="highlight ${availableRooms > rooms.length * 0.3 ? 'positive' : 'warning'}">
                        <i class="fas ${availableRooms > rooms.length * 0.3 ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
                        <span>${Math.round((availableRooms / rooms.length) * 100)}% rooms available</span>
                    </div>
                    <div class="highlight ${activeBookings > 0 ? 'positive' : 'neutral'}">
                        <i class="fas ${activeBookings > 0 ? 'fa-check-circle' : 'fa-info-circle'}"></i>
                        <span>${activeBookings} active stays in progress</span>
                    </div>
                    <div class="highlight ${todayRevenue > 0 ? 'positive' : 'neutral'}">
                        <i class="fas ${todayRevenue > 0 ? 'fa-check-circle' : 'fa-info-circle'}"></i>
                        <span>SAR${todayRevenue.toFixed(2)} revenue generated today</span>
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading quick stats:', error);
        document.getElementById('quickStats').innerHTML = `
            <div class="error-message">
                <p>Failed to load statistics: ${error.message}</p>
                <button class="btn btn-primary" onclick="loadQuickStats()">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

// Export data (simulated)
function exportData() {
    const dataType = document.getElementById('exportDataType').value;
    const format = document.querySelector('input[name="exportFormat"]:checked').value;
    
    // Show export in progress
    showNotification(`Exporting ${dataType} data as ${format.toUpperCase()}...`, 'info');
    
    // Simulate export process
    setTimeout(() => {
        showNotification(`${dataType.toUpperCase()} data exported successfully!`, 'success');
        
        // In a real application, this would trigger a file download
        console.log(`Exporting ${dataType} as ${format}`);
    }, 1500);
}

// Add reports system styles
if (!document.querySelector('#reports-styles')) {
    const style = document.createElement('style');
    style.id = 'reports-styles';
    style.textContent = `
        .reports-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .report-card {
            background: white;
            border-radius: 10px;
            box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
            overflow: hidden;
        }
        
        .report-card.full-width {
            grid-column: 1 / -1;
        }
        
        .report-header {
            padding: 20px;
            border-bottom: 1px solid #dee2e6;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .report-header h3 {
            margin: 0;
            color: #2c3e50;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .report-body {
            padding: 20px;
        }
        
        .date-filters {
            margin-bottom: 20px;
        }
        
        .date-filters .form-row {
            margin-bottom: 15px;
        }
        
        .report-results {
            min-height: 300px;
            max-height: 500px;
            overflow-y: auto;
        }
        
        .placeholder {
            text-align: center;
            padding: 50px 20px;
            color: #6c757d;
        }
        
        .placeholder i {
            font-size: 3rem;
            margin-bottom: 15px;
            opacity: 0.3;
        }
        
        .revenue-summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .summary-card {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }
        
        .summary-card h4 {
            margin: 0 0 10px 0;
            font-size: 0.9rem;
            color: #6c757d;
        }
        
        .summary-card .amount {
            font-size: 1.5rem;
            font-weight: 600;
            color: #2c3e50;
        }
        
        .total-revenue .amount {
            color: #28a745;
        }
        
        .refunds .amount {
            color: #dc3545;
        }
        
        .revenue-details {
            margin-bottom: 30px;
        }
        
        .revenue-details h4 {
            margin-bottom: 15px;
            color: #2c3e50;
        }
        
        .payment-methods {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .payment-method {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .method-name {
            min-width: 120px;
            font-weight: 500;
        }
        
        .method-amount {
            min-width: 80px;
            text-align: right;
            font-weight: 600;
        }
        
        .progress-bar {
            flex: 1;
            height: 8px;
            background: #e9ecef;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .progress {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            border-radius: 4px;
        }
        
        .recent-transactions h4 {
            margin-bottom: 15px;
            color: #2c3e50;
        }
        
        .transactions-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .transaction-item {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr;
            gap: 10px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 6px;
            font-size: 0.9rem;
        }
        
        .occupancy-summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .occupancy-chart {
            margin-bottom: 30px;
        }
        
        .occupancy-chart h4 {
            margin-bottom: 15px;
            color: #2c3e50;
        }
        
        .chart-container {
            display: flex;
            align-items: flex-end;
            gap: 15px;
            height: 200px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        
        .chart-bar-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            height: 100%;
        }
        
        .chart-bar {
            width: 30px;
            background: linear-gradient(to top, #667eea, #764ba2);
            border-radius: 4px 4px 0 0;
            margin-bottom: 10px;
        }
        
        .chart-label {
            font-size: 0.8rem;
            color: #6c757d;
            writing-mode: vertical-rl;
            transform: rotate(180deg);
            white-space: nowrap;
        }
        
        .chart-value {
            font-size: 0.9rem;
            font-weight: 600;
            margin-top: 5px;
        }
        
        .occupancy-details h4 {
            margin-bottom: 15px;
            color: #2c3e50;
        }
        
        .top-days {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .top-day {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 6px;
            font-size: 0.9rem;
        }
        
        .stats-container {
            min-height: 300px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-box {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 10px;
        }
        
        .stat-icon {
            width: 50px;
            height: 50px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.2rem;
        }
        
        .stat-content {
            flex: 1;
        }
        
        .stat-value {
            font-size: 1.8rem;
            font-weight: 600;
            color: #2c3e50;
            line-height: 1;
        }
        
        .stat-label {
            font-size: 0.9rem;
            color: #6c757d;
            margin-top: 5px;
        }
        
        .stats-highlights h4 {
            margin-bottom: 15px;
            color: #2c3e50;
        }
        
        .highlights-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .highlight {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 15px;
            border-radius: 8px;
            font-size: 0.9rem;
        }
        
        .highlight.positive {
            background: #d4edda;
            color: #155724;
            border-left: 4px solid #28a745;
        }
        
        .highlight.warning {
            background: #fff3cd;
            color: #856404;
            border-left: 4px solid #ffc107;
        }
        
        .highlight.neutral {
            background: #d1ecf1;
            color: #0c5460;
            border-left: 4px solid #17a2b8;
        }
        
        .export-options {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .format-options {
            display: flex;
            gap: 20px;
            margin-top: 10px;
        }
        
        .format-option {
            display: flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
        }
        
        .format-option input[type="radio"] {
            margin: 0;
        }
        
        .empty-report {
            text-align: center;
            padding: 50px 20px;
            color: #6c757d;
        }
        
        .empty-report i {
            font-size: 3rem;
            margin-bottom: 15px;
            opacity: 0.3;
        }
    `;
    document.head.appendChild(style);
}

// Export functions
window.generateRevenueReport = generateRevenueReport;
window.generateOccupancyReport = generateOccupancyReport;
window.loadQuickStats = loadQuickStats;
window.exportData = exportData;