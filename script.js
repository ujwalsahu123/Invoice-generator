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

    // Request notification permission as early as possible
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }

    // Generate a 3-digit alphanumeric code for the filename
    const alphanumericCode = generateAlphanumericCode(3);
    const filename = `invoice_rohit_sahu_${alphanumericCode}.pdf`;

    // Options for html2pdf
    const opt = {
      margin:       [0,0,0,0], 
      filename:     filename,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: true, scrollX: 0, scrollY: 0 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      // Override the browser's default download behavior
      output: 'blob'
    };

    // Add a class to the body to apply PDF-specific styles
    document.body.classList.add('pdf-generation-view');

    // Apply temporary scaling and centering before the delay
    invoiceElement.style.transform = 'scale(0.93)';
    invoiceElement.style.transformOrigin = 'center center'; 

    console.log('Styles applied. Waiting 2 seconds before generating PDF...');
    
    // Update download button text and disable it during processing
    const downloadBtn = document.getElementById('downloadBtn');
    const originalBtnText = downloadBtn.textContent;
    downloadBtn.textContent = "Processing...";
    downloadBtn.disabled = true;
    
    // Add a delay to ensure the scaled invoice is fully rendered before capturing
    setTimeout(() => {
      console.log('Timer finished. Generating PDF now.');
      
      // Use a different approach that avoids the browser's download confirmation
      html2pdf().from(invoiceElement).set(opt).outputPdf('blob').then((pdfBlob) => {
        // Reset styles after generating
        document.body.classList.remove('pdf-generation-view');
        invoiceElement.style.transform = '';
        invoiceElement.style.transformOrigin = '';
        
        // Create a URL for the blob
        const blobUrl = URL.createObjectURL(pdfBlob);
        
        // Create an invisible link element and trigger the download programmatically
        const downloadLink = document.createElement('a');
        downloadLink.style.display = 'none';
        downloadLink.href = blobUrl;
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        
        // Trigger a click on the link to start the download without confirmation
        downloadLink.click();
        
        // Clean up
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
          document.body.removeChild(downloadLink);
          console.log('PDF saved and styles reset.');
          
          // Show browser notification after PDF is downloaded
          showBrowserNotification(filename);
          
          // Reset download button
          downloadBtn.textContent = originalBtnText;
          downloadBtn.disabled = false;
        }, 100);
      }).catch(err => {
        // Reset styles even if there's an error
        document.body.classList.remove('pdf-generation-view');
        invoiceElement.style.transform = '';
        invoiceElement.style.transformOrigin = '';
        console.error('PDF generation failed:', err);
        alert('Failed to generate PDF. Check console for details.');
        
        // Reset download button
        downloadBtn.textContent = originalBtnText;
        downloadBtn.disabled = false;
      });
    }, 2000); // 2-second delay
  }
  
  // Function to generate a random alphanumeric code of specified length
  function generateAlphanumericCode(length) {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing characters like I, O, 0, 1
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  // ===== Show Browser Notification =====
  function showBrowserNotification(filename) {
    // Check if the browser supports notifications
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notifications");
      alert("Your invoice PDF has been downloaded successfully! Click OK to open the file.");
      
      // Try to open downloads folder directly
      openDownloadedFile(filename);
      return;
    }
    
    // Check if permission is already granted
    if (Notification.permission === "granted") {
      // If it's granted, create a notification
      createNotification(filename);
    } 
    // Otherwise, request permission
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(function (permission) {
        // If the user accepts, create a notification
        if (permission === "granted") {
          createNotification(filename);
        } else {
          // Fall back to alert if notification permission denied
          alert("Your invoice PDF has been downloaded successfully! Click OK to open the file.");
          openDownloadedFile(filename);
        }
      });
    } else {
      // Fall back to alert if notification permission was previously denied
      alert("Your invoice PDF has been downloaded successfully! Click OK to open the file.");
      openDownloadedFile(filename);
    }
  }

  // Helper function to create the notification
  function createNotification(filename) {
    const options = {
      body: `Your invoice is ready! Tap to open the file.`,
      icon: 'https://cdn-icons-png.flaticon.com/512/337/337946.png', // PDF icon
      requireInteraction: false // Auto-dismiss after default time
    };
    
    const notification = new Notification("Invoice Downloaded", options);
    
    // Handle notification click
    notification.onclick = function() {
      openDownloadedFile(filename);
      notification.close();
    };
  }

  // Helper function to try to open the downloaded file
  function openDownloadedFile(filename) {
    // Try to open the most likely download location based on the browser
    if (navigator.userAgent.indexOf("Chrome") !== -1) {
      window.open('chrome://downloads', '_blank');
    } else if (navigator.userAgent.indexOf("Firefox") !== -1) {
      window.open('about:downloads', '_blank');
    } else if (navigator.userAgent.indexOf("Edge") !== -1 || navigator.userAgent.indexOf("Edg") !== -1) {
      window.open('edge://downloads', '_blank');
    } else {
      // For other browsers or if specific protocol fails, try to open the downloads folder
      const a = document.createElement('a');
      a.href = filename;
      a.download = filename;
      a.click();
    }
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
