// Test data for OCR bill scanning functionality
export const sampleBillTexts = {
  electricity: `
    PACIFIC GAS & ELECTRIC COMPANY
    Electric Service Statement
    
    Service Address: 123 Main St, San Francisco, CA
    Account Number: 1234567890
    
    Billing Period: Jan 15 - Feb 14, 2024
    
    Electric Usage Summary:
    Current Reading: 15,450 kWh
    Previous Reading: 14,950 kWh
    Usage: 500 kWh
    
    Charges:
    Energy Charge: $65.00
    Delivery Charge: $25.00
    Total Amount Due: $90.00
  `,
  
  gas: `
    SOUTHERN CALIFORNIA GAS COMPANY
    Natural Gas Bill
    
    Service Address: 456 Oak Ave, Los Angeles, CA
    Account: 9876543210
    
    Billing Date: February 15, 2024
    
    Gas Usage:
    Current Reading: 2,150 therms
    Previous Reading: 2,050 therms
    Usage This Period: 100 therms
    
    Amount Due: $125.50
  `,
  
  water: `
    CITY OF SEATTLE WATER DEPARTMENT
    Water & Sewer Bill
    
    Service Address: 789 Pine St, Seattle, WA
    Account Number: 5555666677
    
    Billing Period: Jan 1 - Jan 31, 2024
    
    Water Usage:
    Current Reading: 45,200 gallons
    Previous Reading: 43,700 gallons
    Usage: 1,500 gallons
    
    Water Charges: $45.00
    Sewer Charges: $35.00
    Total Due: $80.00
  `,
  
  grocery: `
    WHOLE FOODS MARKET
    123 Market Street
    San Francisco, CA 94102
    
    Date: 02/15/2024 3:45 PM
    
    Organic Bananas        $4.99
    Almond Milk           $5.49
    Bread - Whole Wheat   $3.99
    Chicken Breast        $12.99
    Spinach - Organic     $2.99
    
    Subtotal:            $30.45
    Tax:                  $2.74
    Total:               $33.19
    
    Thank you for shopping with us!
  `,
  
  fuel: `
    SHELL GAS STATION
    Station #12345
    1000 Highway 101, Palo Alto, CA
    
    Date: 02/15/2024 2:30 PM
    Pump: 03
    
    Product: Regular Unleaded
    Price per Gallon: $4.89
    Gallons: 12.5
    
    Fuel Total: $61.13
    
    Payment Method: Credit Card
    Thank you for choosing Shell!
  `
};

// Function to test OCR parsing with sample data
export const testOCRParsing = (ocrService: any) => {
  console.log('Testing OCR parsing with sample bill texts...');
  
  Object.entries(sampleBillTexts).forEach(([type, text]) => {
    console.log(`\n--- Testing ${type} bill ---`);
    try {
      const result = ocrService.parseBillData(text);
      console.log('Parsed result:', result);
    } catch (error) {
      console.error(`Error parsing ${type} bill:`, error);
    }
  });
};
