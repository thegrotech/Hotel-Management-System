// Billing and Invoicing Module
let transactions = [];
let bookings = [];

// Load billing system page
async function loadBillingSystem() {
    const contentArea = document.getElementById('pageContent');
    
    contentArea.innerHTML = `
        <div class="billing-system">
            <h2 class="page-title">
                <i class="fas fa-receipt"></i> Billing & Invoicing
            </h2>
            
            <div class="tabs">
                <div class="tab-header">
                    <button class="tab-btn active" data-tab="invoices">Invoices</button>
                    <button class="tab-btn" data-tab="transactions">Transactions</button>
                    <button class="tab-btn" data-tab="addCharge">Add Charge</button>
                </div>
                
                <div class="tab-content">
                    <!-- Invoices Tab -->
                    <div id="invoicesTab" class="tab-pane active">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">
                                    <i class="fas fa-file-invoice"></i> Booking Invoices
                                </h3>
                                <div class="header-actions">
                                    <input type="text" id="invoiceSearch" class="form-control" 
                                           placeholder="Search by guest name or room..." 
                                           onkeyup="searchInvoices()">
                                    <button class="btn btn-secondary" onclick="loadInvoices()">
                                        <i class="fas fa-redo"></i> Refresh
                                    </button>
                                </div>
                            </div>
                            <div class="card-body">
                                <div id="invoicesList"></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Transactions Tab -->
                    <div id="transactionsTab" class="tab-pane">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">
                                    <i class="fas fa-exchange-alt"></i> All Transactions
                                </h3>
                                <div class="header-actions">
                                    <select id="transactionTypeFilter" class="form-control filter-select" onchange="filterTransactions()">
                                        <option value="">All Types</option>
                                        <option value="booking">Booking</option>
                                        <option value="additional_charge">Additional Charge</option>
                                        <option value="refund">Refund</option>
                                    </select>
                                    <button class="btn btn-secondary" onclick="loadTransactions()">
                                        <i class="fas fa-redo"></i> Refresh
                                    </button>
                                </div>
                            </div>
                            <div class="card-body">
                                <div id="transactionsList"></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Add Charge Tab -->
                    <div id="addChargeTab" class="tab-pane">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">
                                    <i class="fas fa-plus-circle"></i> Add Additional Charge
                                </h3>
                            </div>
                            <div class="card-body">
                                <form id="addChargeForm">
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="chargeBooking">Select Booking *</label>
                                            <select id="chargeBooking" class="form-control" required>
                                                <option value="">Select a booking...</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label for="chargeType">Charge Type *</label>
                                            <select id="chargeType" class="form-control" required>
                                                <option value="additional_charge">Additional Charge</option>
                                                <option value="refund">Refund</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="chargeAmount">Amount (SAR) *</label>
                                            <input type="number" id="chargeAmount" class="form-control" 
                                                   min="0" step="0.01" required>
                                        </div>
                                        <div class="form-group">
                                            <label for="chargePaymentMethod">Payment Method *</label>
                                            <select id="chargePaymentMethod" class="form-control" required>
                                                <option value="cash">Cash</option>
                                                <option value="credit_card">Credit Card</option>
                                                <option value="debit_card">Debit Card</option>
                                                <option value="online">Online</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="chargeNotes">Notes (Optional)</label>
                                        <textarea id="chargeNotes" class="form-control" rows="3" 
                                                  placeholder="Enter charge description..."></textarea>
                                    </div>
                                    
                                    <div class="form-actions">
                                        <button type="submit" class="btn btn-primary">
                                            <i class="fas fa-plus"></i> Add Charge
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Setup tabs
    setupBillingTabs();
    
    // Load initial data
    loadInvoices();
    loadTransactions();
    loadBookingsForCharges();
    
    // Setup add charge form
    setupAddChargeForm();
}

// Setup billing tabs
function setupBillingTabs() {
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
            if (tabId === 'invoices') {
                loadInvoices();
            } else if (tabId === 'transactions') {
                loadTransactions();
            }
        });
    });
}

// Load invoices (bookings with payment info)
async function loadInvoices() {
    try {
        const response = await fetch('/api/bookings', {
            headers: auth.getAuthHeaders()
        });
        
        if (response.ok) {
            bookings = await response.json();
            renderInvoices(bookings);
        }
    } catch (error) {
        console.error('Error loading invoices:', error);
        document.getElementById('invoicesList').innerHTML = `
            <div class="error-message">
                <p>Failed to load invoices: ${error.message}</p>
                <button class="btn btn-primary" onclick="loadInvoices()">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

// Render invoices
function renderInvoices(bookingsList = bookings) {
    const container = document.getElementById('invoicesList');
    
    if (bookingsList.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-invoice"></i>
                <h4>No Bookings Found</h4>
                <p>No bookings have been created yet.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Invoice #</th>
                    <th>Guest</th>
                    <th>Room</th>
                    <th>Dates</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${bookingsList.map(booking => `
                    <tr>
                        <td><strong>INV-${String(booking.id).padStart(4, '0')}</strong></td>
                        <td>${booking.first_name} ${booking.last_name}</td>
                        <td>${booking.room_number}</td>
                        <td>
                            ${new Date(booking.check_in_date).toLocaleDateString()} - 
                            ${new Date(booking.check_out_date).toLocaleDateString()}
                        </td>
                        <td>SAR${booking.total_amount}</td>
                        <td>
                            <span class="status-${booking.status}">
                                ${booking.status.replace('_', ' ').toUpperCase()}
                            </span>
                        </td>
                        <td>
                            ${booking.payment_status === 'completed' ? 
                              `<span class="text-success"><i class="fas fa-check-circle"></i> Paid</span>` :
                              `<span class="text-warning"><i class="fas fa-clock"></i> ${booking.payment_status}</span>`
                            }
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-info" onclick="viewInvoice(${booking.id})">
                                    <i class="fas fa-eye"></i> View
                                </button>
                                <button class="btn btn-sm btn-secondary" onclick="printInvoice(${booking.id})">
                                    <i class="fas fa-print"></i> Print
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Search invoices
function searchInvoices() {
    const searchTerm = document.getElementById('invoiceSearch').value.toLowerCase();
    
    if (!searchTerm) {
        renderInvoices();
        return;
    }
    
    const filteredBookings = bookings.filter(booking => 
        booking.first_name.toLowerCase().includes(searchTerm) ||
        booking.last_name.toLowerCase().includes(searchTerm) ||
        booking.room_number.toLowerCase().includes(searchTerm) ||
        booking.id.toString().includes(searchTerm)
    );
    
    renderInvoices(filteredBookings);
}

// View invoice details
async function viewInvoice(bookingId) {
    try {
        const response = await fetch(`/api/billing/invoice/${bookingId}`, {
            headers: auth.getAuthHeaders()
        });
        
        if (response.ok) {
            const invoice = await response.json();
            showInvoiceModal(invoice);
        }
    } catch (error) {
        console.error('Error loading invoice:', error);
        showNotification(`Failed to load invoice: ${error.message}`, 'error');
    }
}

// Show invoice modal
function showInvoiceModal(invoice) {
    const additionalCharges = invoice.additional_charges || [];
    const totalAdditional = additionalCharges.reduce((sum, charge) => sum + (charge.amount || 0), 0);
    const grandTotal = parseFloat(invoice.total_amount) + totalAdditional;
    
    const modalHtml = `
        <div class="modal-overlay">
            <div class="modal" style="max-width: 800px;">
                <div class="modal-header">
                    <h3><i class="fas fa-file-invoice"></i> Invoice #INV-${String(invoice.id).padStart(4, '0')}</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="invoice-details">
                        <div class="invoice-header">
                            <div class="hotel-info">
                                <h3>Hotel Management System</h3>
                                <p>123 Hotel Street, City</p>
                                <p>Phone: (123) 456-7890</p>
                                <p>Email: info@hotel.com</p>
                            </div>
                            <div class="invoice-info">
                                <h4>INVOICE</h4>
                                <p><strong>Invoice #:</strong> INV-${String(invoice.id).padStart(4, '0')}</p>
                                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                        
                        <div class="invoice-body">
                            <div class="billing-info">
                                <div class="bill-to">
                                    <h5>Bill To:</h5>
                                    <p><strong>${invoice.first_name} ${invoice.last_name}</strong></p>
                                    <p>Phone: ${invoice.phone}</p>
                                    ${invoice.email ? `<p>Email: ${invoice.email}</p>` : ''}
                                </div>
                                <div class="booking-info">
                                    <h5>Booking Details:</h5>
                                    <p><strong>Room:</strong> ${invoice.room_number}</p>
                                    <p><strong>Check-in:</strong> ${new Date(invoice.check_in_date).toLocaleDateString()}</p>
                                    <p><strong>Check-out:</strong> ${new Date(invoice.check_out_date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            
                            <table class="invoice-table">
                                <thead>
                                    <tr>
                                        <th>Description</th>
                                        <th>Quantity</th>
                                        <th>Unit Price</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Room ${invoice.room_number} (${invoice.room_type})</td>
                                        <td>${Math.ceil((new Date(invoice.check_out_date) - new Date(invoice.check_in_date)) / (1000 * 60 * 60 * 24))} nights</td>
                                        <td>SAR${invoice.price_per_night}</td>
                                        <td>SAR${invoice.total_amount}</td>
                                    </tr>
                                    ${additionalCharges.map(charge => charge ? `
                                        <tr>
                                            <td>${charge.type === 'additional_charge' ? 'Additional Charge' : 'Refund'}: ${charge.notes || 'N/A'}</td>
                                            <td>1</td>
                                            <td>SAR${charge.amount}</td>
                                            <td>SAR${charge.amount}</td>
                                        </tr>
                                    ` : '').join('')}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="3" style="text-align: right;"><strong>Subtotal:</strong></td>
                                        <td><strong>SAR${invoice.total_amount}</strong></td>
                                    </tr>
                                    ${totalAdditional > 0 ? `
                                        <tr>
                                            <td colspan="3" style="text-align: right;"><strong>Additional Charges:</strong></td>
                                            <td><strong>SAR${totalAdditional.toFixed(2)}</strong></td>
                                        </tr>
                                    ` : ''}
                                    <tr class="total-row">
                                        <td colspan="3" style="text-align: right;"><strong>Total Amount:</strong></td>
                                        <td><strong>SAR${grandTotal.toFixed(2)}</strong></td>
                                    </tr>
                                </tfoot>
                            </table>
                            
                            <div class="invoice-footer">
                                <div class="payment-info">
                                    <h5>Payment Information:</h5>
                                    <p><strong>Total Paid:</strong> SAR${invoice.total_paid || invoice.total_amount}</p>
                                    <p><strong>Balance Due:</strong> SAR${(grandTotal - (invoice.total_paid || invoice.total_amount)).toFixed(2)}</p>
                                </div>
                                <div class="thank-you">
                                    <p>Thank you for your business!</p>
                                    <p>Please make payment within 30 days.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal()">Close</button>
                    <button class="btn btn-primary" onclick="printInvoice(${invoice.id})">
                        <i class="fas fa-print"></i> Print Invoice
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Print invoice
function printInvoice(bookingId) {
    // For now, just show a message
    // In a real application, you would generate a printable PDF
    showNotification('Print functionality would generate a printable PDF invoice', 'info');
}

// Load transactions
async function loadTransactions() {
    try {
        const response = await fetch('/api/billing/transactions', {
            headers: auth.getAuthHeaders()
        });
        
        if (response.ok) {
            transactions = await response.json();
            renderTransactions();
        }
    } catch (error) {
        console.error('Error loading transactions:', error);
        document.getElementById('transactionsList').innerHTML = `
            <div class="error-message">
                <p>Failed to load transactions: ${error.message}</p>
                <button class="btn btn-primary" onclick="loadTransactions()">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

// Render transactions
function renderTransactions(filteredTransactions = null) {
    const displayTransactions = filteredTransactions || transactions;
    const container = document.getElementById('transactionsList');
    
    if (displayTransactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exchange-alt"></i>
                <h4>No Transactions</h4>
                <p>No transactions have been recorded yet.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Guest</th>
                    <th>Room</th>
                    <th>Amount</th>
                    <th>Payment Method</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${displayTransactions.map(transaction => `
                    <tr>
                        <td>${new Date(transaction.transaction_date).toLocaleDateString()}</td>
                        <td>
                            <span class="badge badge-${transaction.transaction_type}">
                                ${transaction.transaction_type.replace('_', ' ').toUpperCase()}
                            </span>
                        </td>
                        <td>${transaction.first_name} ${transaction.last_name}</td>
                        <td>${transaction.room_number || 'N/A'}</td>
                        <td class="${transaction.transaction_type === 'refund' ? 'text-danger' : 'text-success'}">
                            ${transaction.transaction_type === 'refund' ? '-' : '+'}SAR${transaction.amount}
                        </td>
                        <td>${transaction.payment_method.replace('_', ' ').toUpperCase()}</td>
                        <td>
                            <span class="status-${transaction.payment_status}">
                                ${transaction.payment_status.toUpperCase()}
                            </span>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Filter transactions
function filterTransactions() {
    const typeFilter = document.getElementById('transactionTypeFilter').value;
    
    if (!typeFilter) {
        renderTransactions();
        return;
    }
    
    const filtered = transactions.filter(t => t.transaction_type === typeFilter);
    renderTransactions(filtered);
}

// Load bookings for add charge form
async function loadBookingsForCharges() {
    try {
        const response = await fetch('/api/bookings', {
            headers: auth.getAuthHeaders()
        });
        
        if (response.ok) {
            const allBookings = await response.json();
            const activeBookings = allBookings.filter(b => 
                b.status === 'confirmed' || b.status === 'checked_in'
            );
            
            const select = document.getElementById('chargeBooking');
            select.innerHTML = '<option value="">Select a booking...</option>';
            
            activeBookings.forEach(booking => {
                select.innerHTML += `
                    <option value="${booking.id}">
                        Booking #${booking.id} - ${booking.first_name} ${booking.last_name} (Room ${booking.room_number})
                    </option>
                `;
            });
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

// Setup add charge form
function setupAddChargeForm() {
    const form = document.getElementById('addChargeForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const chargeData = {
                booking_id: document.getElementById('chargeBooking').value,
                transaction_type: document.getElementById('chargeType').value,
                amount: parseFloat(document.getElementById('chargeAmount').value),
                payment_method: document.getElementById('chargePaymentMethod').value,
                notes: document.getElementById('chargeNotes').value || null
            };
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitBtn.disabled = true;
            
            try {
                const response = await fetch('/api/billing/transaction', {
                    method: 'POST',
                    headers: auth.getAuthHeaders(),
                    body: JSON.stringify(chargeData)
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to add charge');
                }
                
                // Reset form
                form.reset();
                showNotification('Charge added successfully!', 'success');
                
                // Refresh transactions list
                loadTransactions();
                
            } catch (error) {
                showNotification(`Error: ${error.message}`, 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// Add billing system styles
if (!document.querySelector('#billing-styles')) {
    const style = document.createElement('style');
    style.id = 'billing-styles';
    style.textContent = `
        .billing-system .tab-header {
            margin-top: 20px;
        }
        
        .invoice-details {
            background: white;
            padding: 30px;
        }
        
        .invoice-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #667eea;
        }
        
        .hotel-info h3 {
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .hotel-info p {
            color: #6c757d;
            margin: 5px 0;
        }
        
        .invoice-info h4 {
            color: #667eea;
            font-size: 1.5rem;
            margin-bottom: 10px;
        }
        
        .invoice-info p {
            margin: 5px 0;
            text-align: right;
        }
        
        .invoice-body {
            margin-top: 30px;
        }
        
        .billing-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 30px;
        }
        
        .bill-to h5, .booking-info h5 {
            color: #2c3e50;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #dee2e6;
        }
        
        .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
        }
        
        .invoice-table th {
            background: #f8f9fa;
            padding: 15px;
            text-align: left;
            border-bottom: 2px solid #dee2e6;
        }
        
        .invoice-table td {
            padding: 15px;
            border-bottom: 1px solid #dee2e6;
        }
        
        .invoice-table tfoot {
            background: #f8f9fa;
        }
        
        .total-row {
            font-size: 1.1rem;
        }
        
        .invoice-footer {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #dee2e6;
        }
        
        .payment-info h5 {
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .thank-you {
            text-align: right;
        }
        
        .thank-you p {
            color: #6c757d;
            margin: 5px 0;
        }
        
        .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.85rem;
            font-weight: 500;
        }
        
        .badge-booking {
            background: #e7f3ff;
            color: #0056b3;
        }
        
        .badge-additional_charge {
            background: #fff3cd;
            color: #856404;
        }
        
        .badge-refund {
            background: #f8d7da;
            color: #721c24;
        }
        
        .text-danger {
            color: #dc3545 !important;
        }
        
        .text-success {
            color: #28a745 !important;
        }
        
        .text-warning {
            color: #ffc107 !important;
        }
    `;
    document.head.appendChild(style);
}

// Export functions
window.searchInvoices = searchInvoices;
window.viewInvoice = viewInvoice;
window.printInvoice = printInvoice;
window.loadInvoices = loadInvoices;
window.loadTransactions = loadTransactions;
window.filterTransactions = filterTransactions;