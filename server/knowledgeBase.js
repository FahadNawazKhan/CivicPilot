const knowledgeBase = {
  "passport": {
    "id": "passport",
    "name": "Passport Application",
    "description": "Apply for a fresh or renewal of an Indian passport for international travel.",
    "department": "Ministry of External Affairs (MEA)",
    "timeline": "15-30 Days (Normal), 3-7 Days (Tatkaal)",
    "estimatedCost": "₹1,500 (Normal), ₹3,500 (Tatkaal)",
    "eligibility": [
      { "id": "citizenship", "question": "Are you a citizen of India?", "expected": true, "errorMsg": "Only Indian citizens can apply." },
      { "id": "age", "question": "Are you 18 years of age or older? (Minors require parental consent)", "expected": true, "errorMsg": "Minors must apply under the minor category with parent details." }
    ],
    "documents": [
      { "name": "Aadhaar Card", "description": "Proof of Identity and Address" },
      { "name": "PAN Card", "description": "Proof of Identity (Optional, recommended)" },
      { "name": "Proof of Date of Birth", "description": "Birth Certificate, School Leaving Certificate, or Matriculation Certificate" },
      { "name": "Address Proof", "description": "Electricity Bill, Water Bill, Rent Agreement, or Parent's Passport (if minor)" }
    ],
    "steps": [
      { "id": "step1", "title": "Online Registration", "desc": "Register on the Passport Seva Online Portal and create an account.", "duration": "1 Day", "cost": "Free", "link": "https://www.passportindia.gov.in" },
      { "id": "step2", "title": "Form Submission & Payment", "desc": "Fill out the online application form and pay the application fee online.", "duration": "1 Day", "cost": "₹1,500 - ₹3,500", "link": "https://www.passportindia.gov.in" },
      { "id": "step3", "title": "Book Appointment", "desc": "Schedule an appointment at the nearest Passport Seva Kendra (PSK) or Post Office Passport Seva Kendra (POPSK).", "duration": "2-5 Days", "cost": "Free", "link": "https://www.passportindia.gov.in" },
      { "id": "step4", "title": "Physical Verification (PSK)", "desc": "Visit the PSK for document verification, biometrics (fingerprints), and photograph capture.", "duration": "1 Day", "cost": "Free", "link": "Local PSK Center" },
      { "id": "step5", "title": "Police Verification", "desc": "A police officer will visit your registered address or request you to visit the local police station to verify identity and record.", "duration": "7-14 Days", "cost": "Free (No tips allowed)", "link": "Local Police Station" },
      { "id": "step6", "title": "Passport Dispatch", "desc": "Passport is printed and dispatched via Speed Post to your registered address.", "duration": "3-7 Days", "cost": "Free", "link": "India Post Tracking" }
    ]
  },
  "driving_license": {
    "id": "driving_license",
    "name": "Driving License Application",
    "description": "Obtain a permanent license to drive two-wheelers, light motor vehicles (cars), or commercial vehicles.",
    "department": "State Transport Department (RTO)",
    "timeline": "30-45 Days (Requires 30 days gap after Learner's License)",
    "estimatedCost": "₹500 - ₹1,000",
    "eligibility": [
      { "id": "age", "question": "Are you 18 years of age or older? (16 for gearless 50cc, 20 for transport)", "expected": true, "errorMsg": "You must be at least 18 years old to drive geared two-wheelers or cars." },
      { "id": "learners", "question": "Do you hold a valid Learner's License that is at least 30 days old?", "expected": true, "errorMsg": "You must first obtain a Learner's License and wait 30 days before taking the permanent driving test." }
    ],
    "documents": [
      { "name": "Learner's License", "description": "Valid LL details" },
      { "name": "Aadhaar Card", "description": "Address and Identity Proof" },
      { "name": "Age Proof", "description": "PAN Card, Birth Certificate, or School Certificate" },
      { "name": "Medical Certificate Form 1A", "description": "Required for applicants over 40 years of age or for commercial licenses" }
    ],
    "steps": [
      { "id": "step1", "title": "Learner's License Application", "desc": "Submit LL application on the Sarathi Parivahan portal and complete the online road rules test.", "duration": "1-3 Days", "cost": "₹150 - ₹300", "link": "https://sarathi.parivahan.gov.in" },
      { "id": "step2", "title": "Wait 30 Days", "desc": "Practice driving. You can only apply for a permanent license 30 days after the LL issue date.", "duration": "30 Days", "cost": "Free", "link": "" },
      { "id": "step3", "title": "Book Slot for Driving Test", "desc": "Apply online for a Permanent Driving License and book a slot for the physical driving test at the RTO.", "duration": "2-5 Days", "cost": "₹300 - ₹500", "link": "https://sarathi.parivahan.gov.in" },
      { "id": "step4", "title": "Physical Driving Test", "desc": "Report to the RTO track with your vehicle and L-board. Take the driving test in front of the MVI inspector.", "duration": "1 Day", "cost": "Free", "link": "RTO Office" },
      { "id": "step5", "title": "License Dispatch", "desc": "Upon passing the test, the smart card license is printed and mailed to your home.", "duration": "7-15 Days", "cost": "Free", "link": "Speed Post" }
    ]
  },
  "gst_registration": {
    "id": "gst_registration",
    "name": "GST Registration",
    "description": "Register for Goods and Services Tax (GST) for businesses exceeding threshold limits or making inter-state sales.",
    "department": "Goods and Services Tax Network (GSTN), Ministry of Finance",
    "timeline": "3-7 Days",
    "estimatedCost": "Free (Government Fee is ₹0)",
    "eligibility": [
      { "id": "pan", "question": "Do you possess a valid PAN (Permanent Account Number) card?", "expected": true, "errorMsg": "A valid PAN is mandatory for GST registration." },
      { "id": "address", "question": "Do you have a dedicated commercial or residential space to serve as principal place of business?", "expected": true, "errorMsg": "A business address proof is required." }
    ],
    "documents": [
      { "name": "PAN Card of Business/Proprietor", "description": "Mandatory PAN details" },
      { "name": "Aadhaar Card", "description": "Identification of proprietor/directors" },
      { "name": "Proof of Business Place", "description": "Electricity Bill, Property Tax receipt, or Rent Agreement along with NOC from owner" },
      { "name": "Bank Account Proof", "description": "Cancelled cheque, first page of passbook, or bank statement" }
    ],
    "steps": [
      { "id": "step1", "title": "TRN Generation", "desc": "Fill Part A of registration form GST REG-01 with PAN, Mobile, and Email on the GST Portal to receive a Temporary Reference Number (TRN).", "duration": "1 Day", "cost": "Free", "link": "https://www.gst.gov.in" },
      { "id": "step2", "title": "Submit Application Details", "desc": "Log in with TRN and complete Part B. Fill business details, promoters, principal place of business, goods/services, and upload documents.", "duration": "1-2 Days", "cost": "Free", "link": "https://www.gst.gov.in" },
      { "id": "step3", "title": "Aadhaar Authentication", "desc": "Complete the Aadhaar OTP authentication link received on registered mobile number.", "duration": "1 Day", "cost": "Free", "link": "Sent via Email" },
      { "id": "step4", "title": "Officer Review", "desc": "An officer reviews the application. If correct, registration is approved. If clarification is needed, a notice (GST REG-03) is issued.", "duration": "3-5 Days", "cost": "Free", "link": "https://www.gst.gov.in" },
      { "id": "step5", "title": "Download GST Certificate", "desc": "Upon approval, download Form GST REG-06 containing your GSTIN (15-digit number) from the dashboard.", "duration": "1 Day", "cost": "Free", "link": "https://www.gst.gov.in" }
    ]
  },
  "business_registration": {
    "id": "business_registration",
    "name": "Business Registration (Private Limited)",
    "description": "Incorporate a Private Limited Company or One Person Company (OPC) with the Ministry of Corporate Affairs.",
    "department": "Ministry of Corporate Affairs (MCA)",
    "timeline": "7-14 Days",
    "estimatedCost": "₹6,000 - ₹12,000 (Includes government stamp duty and DSC/DIN costs)",
    "eligibility": [
      { "id": "directors", "question": "Do you have at least 2 directors? (1 for OPC)", "expected": true, "errorMsg": "A Private Limited company requires a minimum of 2 directors." },
      { "id": "pan_all", "question": "Do all directors have valid PAN and Aadhaar cards?", "expected": true, "errorMsg": "PAN and Aadhaar are mandatory for director registration." }
    ],
    "documents": [
      { "name": "Director PAN & Aadhaar", "description": "KYC for all directors" },
      { "name": "Address Proof for Directors", "description": "Bank statement, utility bill (less than 2 months old)" },
      { "name": "Registered Office Address Proof", "description": "Electricity bill / gas bill and NOC from property owner" },
      { "name": "Specimen Signature Card / Consent Forms", "description": "INC-9 and DIR-2 declarations" }
    ],
    "steps": [
      { "id": "step1", "title": "Obtain Digital Signature Certificate (DSC)", "desc": "Apply for DSC (Class 3) for all proposed directors to sign digital documents.", "duration": "1-2 Days", "cost": "₹1,000 - ₹2,000", "link": "Licensed Certifying Authorities" },
      { "id": "step2", "title": "Name Reservation (RUN)", "desc": "Submit 2 proposed names on the MCA portal via RUN (Reserve Unique Name) service.", "duration": "2-3 Days", "cost": "₹1,000", "link": "https://www.mca.gov.in" },
      { "id": "step3", "title": "SPICe+ Form Submission", "desc": "Fill Spice+ Form (INC-32) which includes Application for DIN (Director Identification Number), Incorporation (Form INC-32), MOA (INC-33), AOA (INC-34), PAN, and TAN applications.", "duration": "3-5 Days", "cost": "₹3,000 - ₹6,000 (Varies by Capital)", "link": "https://www.mca.gov.in" },
      { "id": "step4", "title": "Certificate of Incorporation", "desc": "Once approved, the Registrar of Companies (ROC) issues a Certificate of Incorporation (COI) containing the Corporate Identity Number (CIN) along with PAN and TAN.", "duration": "2-3 Days", "cost": "Free", "link": "https://www.mca.gov.in" },
      { "id": "step5", "title": "Open Bank Account", "desc": "Open a corporate bank account using the COI, PAN, and TAN of the company.", "duration": "2-3 Days", "cost": "Free (Requires initial deposit)", "link": "Any Commercial Bank" }
    ]
  },
  "medical_store": {
    "id": "medical_store",
    "name": "Medical Store License (Pharmacy)",
    "description": "Start a retail or wholesale pharmacy store. Requires a qualified pharmacist and Drug License.",
    "department": "State Drugs Control Administration (CDSCO)",
    "timeline": "20-30 Days",
    "estimatedCost": "₹5,000 - ₹10,000",
    "eligibility": [
      { "id": "pharmacist", "question": "Do you have a registered pharmacist (B.Pharm/D.Pharm) to act as competent person?", "expected": true, "errorMsg": "A pharmacy cannot operate without a registered pharmacist under the Drugs and Cosmetics Act." },
      { "id": "premises", "question": "Does the retail store premises have an area of at least 10 square meters (15 sqm for wholesale+retail)?", "expected": true, "errorMsg": "The drug department mandates a minimum of 10 square meters shop area." },
      { "id": "refrigerator", "question": "Do you have a functional refrigerator and air conditioner installed?", "expected": true, "errorMsg": "Drugs require temperature-controlled storage. Refrigerator details are checked during physical inspection." }
    ],
    "documents": [
      { "name": "Pharmacist Registration Certificate", "description": "State Pharmacy Council Certificate & Qualification docs" },
      { "name": "Layout Blueprint of the Premises", "description": "Key plan and site plan of the shop" },
      { "name": "Ownership/Rent Proof of Premises", "description": "Rent agreement, tax receipts, or ownership deed" },
      { "name": "Refrigerator & AC Purchase Invoice", "description": "Proof of cooling appliances" }
    ],
    "steps": [
      { "id": "step1", "title": "Incorporate Business & Get GST", "desc": "Register your business structure (Proprietorship/LLP/Pvt Ltd) and apply for a GST number.", "duration": "7 Days", "cost": "Free (GST)", "link": "https://www.gst.gov.in" },
      { "id": "step2", "title": "Prepare Premises", "desc": "Set up shelves, refrigerator, AC, and get a blueprint map of the layout designed by an architect.", "duration": "5-10 Days", "cost": "Varies", "link": "" },
      { "id": "step3", "title": "Apply for Drug License", "desc": "Submit Form 19 for Retail Drug License (Form 20/21) on the State Drug Control online portal.", "duration": "2 Days", "cost": "₹3,000", "link": "State Drug Control Portal" },
      { "id": "step4", "title": "Physical Inspection", "desc": "A Drug Inspector (DI) will inspect the shop to verify square footage, layout, temperature controls, and registered pharmacist credentials.", "duration": "7-14 Days", "cost": "Free", "link": "In-person visit" },
      { "id": "step5", "title": "Grant of Drug License", "desc": "If the inspection is satisfactory, the Drug License (Form 20 & 21) is issued digitally.", "duration": "5 Days", "cost": "Free", "link": "Online download" }
    ]
  },
  "restaurant": {
    "id": "restaurant",
    "name": "Restaurant Business License",
    "description": "Licenses required to open and run a restaurant, cafe, or food joint. Involves FSSAI, Trade, and Fire NOC.",
    "department": "FSSAI, Municipal Corporation, and Fire Department",
    "timeline": "25-35 Days",
    "estimatedCost": "₹7,000 - ₹15,000 (Excluding equipment and lease)",
    "eligibility": [
      { "id": "noc", "question": "Do you have a commercial property with a valid fire NOC (if seating capacity is over 30)?", "expected": true, "errorMsg": "Seating capacity over 30 (or high-rise area) mandates a Fire NOC for safety approval." },
      { "id": "health", "question": "Can you ensure all kitchen staff obtain basic medical fitness certificates?", "expected": true, "errorMsg": "Health certificates are mandatory for FSSAI compliance to prevent food-borne contamination." }
    ],
    "documents": [
      { "name": "FSSAI Registration Documents", "description": "NOC, Layout plan of kitchen, list of equipment, and water analysis report" },
      { "name": "Trade License / Health Trade License Details", "description": "Property documents, tax paid receipt, and structural stability certificate" },
      { "name": "Fire NOC (If seating > 30)", "description": "Fire safety systems approval" },
      { "name": "NOC from Landlord", "description": "Rental agreement and permission to run a restaurant" }
    ],
    "steps": [
      { "id": "step1", "title": "Apply for FSSAI State License", "desc": "Submit application on FosCos portal. Require kitchen layout, water test report, and list of food categories.", "duration": "15 Days", "cost": "₹2,000 - ₹5,000", "link": "https://foscos.fssai.gov.in" },
      { "id": "step2", "title": "Apply for Trade License", "desc": "Apply to the local Municipal Corporation for a Health Trade License to run a commercial eating house.", "duration": "10-15 Days", "cost": "₹5,000 - ₹10,000", "link": "Municipal Portal" },
      { "id": "step3", "title": "Fire & Environmental NOC", "desc": "Get a certificate from the Fire Department (if applicable) and Pollution Control Board (green/orange category).", "duration": "10 Days", "cost": "₹2,000 - ₹5,000", "link": "State Single Window System" },
      { "id": "step4", "title": "GST Registration", "desc": "Get GST registration. Note that restaurant services attract 5% GST (without Input Tax Credit).", "duration": "3-7 Days", "cost": "Free", "link": "https://www.gst.gov.in" },
      { "id": "step5", "title": "Launch Restaurant", "desc": "Obtain all licenses, display FSSAI license prominently, and start operations.", "duration": "1 Day", "cost": "Free", "link": "" }
    ]
  },
  "import_export_license": {
    "id": "import_export_license",
    "name": "Import Export Code (IEC)",
    "description": "Register for a 10-digit Import Export Code (IEC) required by any business importing or exporting goods from India.",
    "department": "Directorate General of Foreign Trade (DGFT), Ministry of Commerce",
    "timeline": "1-3 Days",
    "estimatedCost": "₹500 (Government fee)",
    "eligibility": [
      { "id": "business_entity", "question": "Do you have an incorporated business entity or proprietorship?", "expected": true, "errorMsg": "You must have a business entity (like Proprietorship or LLP) to apply." },
      { "id": "pan", "question": "Does the business entity possess a PAN and a current bank account?", "expected": true, "errorMsg": "IEC registration requires the entity PAN and a business bank account." }
    ],
    "documents": [
      { "name": "Business Entity PAN", "description": "PAN card of business or individual proprietor" },
      { "name": "Cancelled Cheque", "description": "Cancelled cheque of the current bank account (displaying printed name)" },
      { "name": "Address Proof of Business", "description": "Rent agreement, electricity bill, sale deed, or NOC" }
    ],
    "steps": [
      { "id": "step1", "title": "Register on DGFT", "desc": "Go to the DGFT website, create an account, and authenticate using email and mobile OTP.", "duration": "1 Day", "cost": "Free", "link": "https://www.dgft.gov.in" },
      { "id": "step2", "title": "Fill ANF-2A Form", "desc": "Fill the online Application for Grant of Import Export Code. Select applicant details, bank account, and branch codes.", "duration": "1 Day", "cost": "Free", "link": "https://www.dgft.gov.in" },
      { "id": "step3", "title": "Upload Documents & Sign", "desc": "Upload digital copies of PAN, address proof, and bank document. Digitally sign the application using DSC or Aadhaar OTP.", "duration": "1 Day", "cost": "Free", "link": "https://www.dgft.gov.in" },
      { "id": "step4", "title": "Payment", "desc": "Pay the application processing fee of ₹500 via BharatKosh on the DGFT payment gateway.", "duration": "1 Day", "cost": "₹500", "link": "https://www.dgft.gov.in" },
      { "id": "step5", "title": "IEC Issuance", "desc": "The IEC certificate is generated instantly upon successful payment. Download and print the PDF certificate.", "duration": "1 Day", "cost": "Free", "link": "https://www.dgft.gov.in" }
    ]
  },
  "trade_license": {
    "id": "trade_license",
    "name": "Trade License",
    "description": "Municipal corporation permission to execute a specific trade or business inside the municipal area.",
    "department": "Local Municipal Corporation (MCD, GHMC, BBMP, etc.)",
    "timeline": "10-20 Days",
    "estimatedCost": "₹2,000 - ₹10,000 (Varies heavily by city and business area)",
    "eligibility": [
      { "id": "age", "question": "Are you 18 years of age or older?", "expected": true, "errorMsg": "Applicant must be an adult." },
      { "id": "zoning", "question": "Is your business property situated in a designated commercial zone (no residential-only operations)?", "expected": true, "errorMsg": "Local laws restrict commercial trading in residential-only zones." }
    ],
    "documents": [
      { "name": "Proof of Property Ownership/Tenancy", "description": "Rent agreement, lease deed, or tax receipt" },
      { "name": "No-Objection Certificate (NOC)", "description": "NOC from immediate neighbors/landlord (if residential/hazard trade)" },
      { "name": "Establishment Layout Map", "description": "Detailed floor layout of the business setup" },
      { "name": "Fire NOC or Structural Stability Certificate", "description": "If required by municipal corporation rules" }
    ],
    "steps": [
      { "id": "step1", "title": "Apply Online / Physical Form", "desc": "Submit the trade license application form with details of the business (type, power consumption, number of employees).", "duration": "1-2 Days", "cost": "Varies", "link": "Local Municipal Portal" },
      { "id": "step2", "title": "Document Verification", "desc": "Municipal officers review the submitted documents, zone classifications, and property tax status.", "duration": "3-5 Days", "cost": "Free", "link": "Municipal Portal" },
      { "id": "step3", "title": "Physical Inspection", "desc": "A ward officer or sanitary inspector visits the premises to check dimensions, zoning compatibility, and health hazards.", "duration": "5-10 Days", "cost": "Free", "link": "On-site Visit" },
      { "id": "step4", "title": "Fee Payment", "desc": "If approved, pay the calculated trade license fee online or via draft.", "duration": "1-2 Days", "cost": "₹2,000 - ₹10,000", "link": "Local Municipal Portal" },
      { "id": "step5", "title": "License Issuance", "desc": "The trade license certificate is issued, usually valid for 1 financial year, renewing every April.", "duration": "2-3 Days", "cost": "Free", "link": "Municipal Portal" }
    ]
  },
  "fssai": {
    "id": "fssai",
    "name": "FSSAI Food License",
    "description": "Register with Food Safety and Standards Authority of India (FSSAI) to ensure food quality and safety standards.",
    "department": "Food Safety and Standards Authority of India (FSSAI)",
    "timeline": "7-10 Days (Registration), 15-30 Days (State/Central License)",
    "estimatedCost": "₹100 (Registration), ₹2,000 - ₹7,500 per year (License)",
    "eligibility": [
      { "id": "hygiene", "question": "Can you commit to maintaining sanitation, basic pest control, and staff hygiene in the kitchen?", "expected": true, "errorMsg": "Compliance with Schedule 4 sanitation guidelines is mandatory." }
    ],
    "documents": [
      { "name": "Photo of Proprietor/Promoter", "description": "Passport size photo" },
      { "name": "Address Proof of Premises", "description": "Rent agreement, electricity bill, or property tax receipt" },
      { "name": "Layout of Food Processing Unit", "description": "Architect schematic showing dimensions (Required for License)" },
      { "name": "Water Analysis Report", "description": "Bacteriological test of the water source (Required for License)" }
    ],
    "steps": [
      { "id": "step1", "title": "Determine Eligibility Category", "desc": "Calculate annual turnover. If under ₹12 Lakhs, apply for Basic Registration. If ₹12 Lakhs - ₹20 Crores, apply for State License. If above ₹20 Crores, apply for Central License.", "duration": "1 Day", "cost": "Free", "link": "https://foscos.fssai.gov.in" },
      { "id": "step2", "title": "Form Submission", "desc": "Fill Form A (Registration) or Form B (License) on the FoSCoS portal. Upload photos, address proof, layout, and raw material details.", "duration": "1-2 Days", "cost": "Free", "link": "https://foscos.fssai.gov.in" },
      { "id": "step3", "title": "Pay Processing Fee", "desc": "Pay the FSSAI license fee online (varies by duration: 1 to 5 years).", "duration": "1 Day", "cost": "₹100 - ₹7,500", "link": "https://foscos.fssai.gov.in" },
      { "id": "step4", "title": "Inspection (If License)", "desc": "A Food Safety Officer (FSO) may conduct a surprise inspection of the kitchen/unit to verify cleanliness standards.", "duration": "7-15 Days", "cost": "Free", "link": "In-person visit" },
      { "id": "step5", "title": "Download FSSAI Certificate", "desc": "Upon approval, the 14-digit FSSAI license number and digital certificate are emailed and can be downloaded from the dashboard.", "duration": "1-3 Days", "cost": "Free", "link": "https://foscos.fssai.gov.in" }
    ]
  },
  "shop_establishment": {
    "id": "shop_establishment",
    "name": "Shop & Establishment License (Gumasta)",
    "description": "Mandatory registration for all businesses operating a physical commercial shop or office under state labor department rules.",
    "department": "State Labor Department",
    "timeline": "2-5 Days",
    "estimatedCost": "₹500 - ₹2,000 (Varies based on the number of employees)",
    "eligibility": [
      { "id": "employees", "question": "Do you employ workers/staff at your shop/office?", "expected": true, "errorMsg": "You must specify employee numbers. Even single-proprietor shops require registration in most states." }
    ],
    "documents": [
      { "name": "PAN & Aadhaar of Proprietor/Directors", "description": "Identity validation" },
      { "name": "Shop Front Photograph", "description": "Clear photo of the shop showing the name board in local language & English" },
      { "name": "Proof of Business Place", "description": "Rent agreement, electricity bill, or property ownership certificate" },
      { "name": "List of Employees", "description": "Names, designations, and wages of staff (if any)" }
    ],
    "steps": [
      { "id": "step1", "title": "Register on State Labor Portal", "desc": "Create a login on the respective State Government Labor Department Portal.", "duration": "1 Day", "cost": "Free", "link": "State Labor Portal" },
      { "id": "step2", "title": "Fill Form A/Form I", "desc": "Enter business name, category, employee details, proprietor details, and operational timings.", "duration": "1 Day", "cost": "Free", "link": "State Labor Portal" },
      { "id": "step3", "title": "Upload Documents", "desc": "Upload shop photos, rental agreement, PAN, and employee lists.", "duration": "1 Day", "cost": "Free", "link": "State Labor Portal" },
      { "id": "step4", "title": "Fee Payment", "desc": "Pay the registration fee based on the number of workers. Most states have auto-approved systems for small setups.", "duration": "1 Day", "cost": "₹500 - ₹2,000", "link": "State Labor Portal" },
      { "id": "step5", "title": "Download License", "desc": "Download the digital registration certificate containing your Shop License registration number.", "duration": "1-2 Days", "cost": "Free", "link": "State Labor Portal" }
    ]
  },
  "aadhaar": {
    "id": "aadhaar",
    "name": "Aadhaar Card (UIDAI)",
    "description": "Apply for a fresh Aadhaar Card or update your existing biometric/demographic details under UIDAI.",
    "department": "Unique Identification Authority of India (UIDAI)",
    "timeline": "10-15 Days",
    "estimatedCost": "Free (Fresh), ₹50 - ₹100 (Updates)",
    "eligibility": [
      { "id": "residence", "question": "Have you resided in India for 182 days or more in the last 12 months?", "expected": true, "errorMsg": "Only Indian residents can apply for Aadhaar." }
    ],
    "documents": [
      { "name": "Proof of Identity (POI)", "description": "PAN Card, Passport, Voter ID, or Driving License" },
      { "name": "Proof of Address (POA)", "description": "Electricity Bill, Water Bill, Rent Agreement, or Bank Statement" },
      { "name": "Proof of Date of Birth (PDB)", "description": "Birth Certificate, Passport, or Matriculation Certificate" }
    ],
    "steps": [
      { "id": "step1", "title": "Online Appointment Booking", "desc": "Book an enrollment appointment online on the myAadhaar portal to skip queues.", "duration": "1 Day", "cost": "Free", "link": "https://myaadhaar.uidai.gov.in" },
      { "id": "step2", "title": "Visit Enrollment Center", "desc": "Visit the nearest authorized Aadhaar Seva Kendra or bank/post office enrollment branch.", "duration": "1 Day", "cost": "Free", "link": "Local UIDAI Center" },
      { "id": "step3", "title": "Biometric & Document Submission", "desc": "Submit physical copies of identity/address proofs, capture photo, fingerprints, and iris scans.", "duration": "1 Day", "cost": "Free (Fresh) / ₹50-100 (Update)", "link": "Local UIDAI Center" },
      { "id": "step4", "title": "Receive EID slip", "desc": "Collect the enrollment acknowledgement slip containing the 14-digit Enrollment ID (EID).", "duration": "1 Day", "cost": "Free", "link": "Local UIDAI Center" },
      { "id": "step5", "title": "Aadhaar Generation & Download", "desc": "UIDAI verifies data. Once generated, download e-Aadhaar online or wait for physical PVC card delivery by post.", "duration": "7-15 Days", "cost": "Free", "link": "https://myaadhaar.uidai.gov.in" }
    ]
  }
};

export default knowledgeBase;