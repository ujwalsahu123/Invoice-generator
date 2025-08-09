// ===== Add Row to Table =====
function addRow(date = '', particular = '', rate = '', amount = '') {
    const tableBody = document.getElementById('workTableBody');
    const row = document.createElement('tr');
  
    row.innerHTML = `
      <td><input type="date" class="row-date" value="${date}"></td>
      <td><input type="text" class="row-particular" value="${particular}"></td>
      <td><input type="number" class="row-rate" value="${rate}" step="1"></td>
      <td><input type="number" class="row-amount" value="${amount}" step="1"></td>
      <td><button type="button" class="removeRowBtn">–</button></td>
    `;
  
    tableBody.appendChild(row);
    updateTotal();
  
    // Remove row on click
    row.querySelector('.removeRowBtn').addEventListener('click', () => {
      row.remove();
      updateTotal();
    });
  
    // Recalculate total if amount changes
    row.querySelectorAll('.row-amount').forEach(input => {
      input.addEventListener('input', updateTotal);
    });
  }
  
  // ===== Update Total Amount =====
  function updateTotal() {
    let total = 0;
    document.querySelectorAll('.row-amount').forEach(input => {
      total += parseInt(input.value || 0);
    });
    document.getElementById('totalAmount').value = total;
  }

  // ===== Format Date to DD-MM-YYYY =====
  function formatDateToDDMMYYYY(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // ===== Handle Position Type Change =====
  function handlePositionTypeChange() {
    // No longer needed since both fields are always visible
  }

  // ===== Convert Number to Words (Indian style) =====
  function numberToWords(num) {
    if (num === 0) return 'Zero';
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if ((num = num.toString()).length > 9) return 'Overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return; 
    
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? ' ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    
    return str.trim();
  }
  
  // ===== Fill Invoice Preview =====
  function fillInvoicePreview() {
    // Format invoice date
    const invoiceDate = document.getElementById('invoiceDate').value;
    document.getElementById('preview-invoiceDate').textContent = formatDateToDDMMYYYY(invoiceDate);
    
    document.getElementById('preview-role').textContent = document.getElementById('role').value;
    document.getElementById('preview-productionName').textContent = document.getElementById('productionName').value;
    document.getElementById('preview-projectName').textContent = document.getElementById('projectName').value;
    
    // Handle position and name
    const positionType = document.getElementById('positionType').value;
    const personName = document.getElementById('personName').value;
    
    const positionLabelEl = document.getElementById('preview-position-label');
    const personNameEl = document.getElementById('preview-person-name');

    if (positionType && personName) {
      positionLabelEl.textContent = positionType + ':'; // Add colon here
      personNameEl.textContent = personName;
      // Ensure the parent <p> tag is visible
      positionLabelEl.parentElement.style.display = 'block';
    } else {
      // Hide the parent <p> tag if there's no content
      positionLabelEl.parentElement.style.display = 'none';
    }
    
    document.getElementById('preview-location').textContent = document.getElementById('location').value;
  
    // Fill table rows
    const tableBody = document.querySelector('#preview-work-table tbody');
    tableBody.innerHTML = ''; // Clear previous
  
    const rowDates = document.querySelectorAll('.row-date');
    const rowParticulars = document.querySelectorAll('.row-particular');
    const rowRates = document.querySelectorAll('.row-rate');
    const rowAmounts = document.querySelectorAll('.row-amount');
  
    for (let i = 0; i < rowDates.length; i++) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="text-align: center;">${formatDateToDDMMYYYY(rowDates[i].value)}</td>
        <td style="text-align: center;">${rowParticulars[i].value}</td>
        <td style="text-align: center;">${parseInt(rowRates[i].value || 0)}</td>
        <td style="text-align: center;">${parseInt(rowAmounts[i].value || 0)}</td>
      `;
      tableBody.appendChild(tr);
    }
  
    const total = parseInt(document.getElementById('totalAmount').value || 0);
    document.getElementById('preview-totalAmount').textContent = total;
    
    const amountInWords = numberToWords(total);
    const currencyWord = total === 1 ? 'Rupee' : 'Rupees';
    document.getElementById('preview-amountWords').textContent = `${amountInWords} ${currencyWord} Only /-`;
  }
  
  // ===== Generate PDF =====
  function generatePDF() {
    console.log('Starting PDF generation...');

    // Check if html2pdf is loaded
    if (typeof html2pdf === 'undefined') {
      alert('PDF library not loaded. Please check if html2pdf.bundle.min.js is properly included.');
      return;
    }

    const invoiceElement = document.getElementById('invoice-template');
    
    if (!invoiceElement || !invoiceElement.textContent.trim()) {
      alert('Invoice appears to be empty. Please generate the invoice first.');
      return;
    }

    // Options for html2pdf
    const opt = {
      margin:       [0,0,0,0], 
      filename:     'invoice_rohit_sahu.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: true, scrollX: 0, scrollY: 0 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Add a class to the body to apply PDF-specific styles
    document.body.classList.add('pdf-generation-view');

    // Apply temporary scaling and centering before the delay
    invoiceElement.style.transform = 'scale(0.93)';
    invoiceElement.style.transformOrigin = 'center center'; 

    console.log('Styles applied. Waiting 2 seconds before generating PDF...');
    
    // Add a delay to ensure the scaled invoice is fully rendered before capturing
    setTimeout(() => {
      console.log('Timer finished. Generating PDF now.');
      
      html2pdf().from(invoiceElement).set(opt).save().then(() => {
        // Reset styles after saving
        document.body.classList.remove('pdf-generation-view'); // Remove the class
        invoiceElement.style.transform = '';
        invoiceElement.style.transformOrigin = '';
        console.log('PDF saved and styles reset.');
      }).catch(err => {
        // Reset styles even if there's an error
        document.body.classList.remove('pdf-generation-view'); // Remove the class
        invoiceElement.style.transform = '';
        invoiceElement.style.transformOrigin = '';
        console.error('PDF generation failed:', err);
        alert('Failed to generate PDF. Check console for details.');
      });
    }, 2000); // 2-second delay
  }
  
  // ===== Event Listeners =====
  document.getElementById('addRowBtn').addEventListener('click', () => addRow());
  
  // Remove the position type change event listener since it's no longer needed
  
  // Add a default row on load
  window.addEventListener('load', () => {
    addRow();
  });
  
  // Handle form submission
  document.getElementById('invoice-form').addEventListener('submit', (e) => {
    e.preventDefault();
    fillInvoicePreview();
    document.getElementById('invoice-preview').style.display = 'block';
  });
  
  // Download PDF
  document.getElementById('downloadBtn').addEventListener('click', generatePDF);
