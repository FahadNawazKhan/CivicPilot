# CivicPilot

CivicPilot is an intelligent, user-friendly digital handbook and checklist planner designed to help citizens understand and complete complex Indian government application processes. Getting documents like passports, driving licenses, or business permits in India can be confusing due to multiple departments, hidden fees, specific document rules, and long wait times. CivicPilot simplifies this by converting complex bureaucratic processes into clear, step-by-step roadmaps, auditing your documents using AI, tracking expiration dates, and hosting a community forum for real-time tips and compliance Q&As.

This document contains a comprehensive manual of the application's goals, features, database schemas, API routes, security controls, and step-by-step setup guides.

---

## Table of Contents
1. [Core Philosophy & Problem Statement](#core-philosophy--problem-statement)
2. [Detailed Feature Guide](#detailed-feature-guide)
    - [Smart Intent Search & Process Finder](#1-smart-intent-search--process-finder)
    - [Step-by-Step Roadmap Checklists](#2-step-by-step-roadmap-checklists)
    - [Interactive Eligibility Checkers](#3-interactive-eligibility-checkers)
    - [AI-Powered Document Verification](#4-ai-powered-document-verification)
    - [Document Expiry Renewal Vault](#5-document-expiry-renewal-vault)
    - [Citizen Forum: Tips & Experiences Feed](#6-citizen-forum-tips--experiences-feed)
    - [Community Q&A Board](#7-community-qa-board)
    - [AI Sahayak Chat Assistant](#8-ai-sahayak-chat-assistant)
    - [Action Plan PDF Downloader](#9-action-plan-pdf-downloader)
3. [Database Architecture & Schema Definitions](#database-architecture--schema-definitions)
    - [User Schema](#user-schema)
    - [Progress Schema](#progress-schema)
    - [Tip Schema](#tip-schema)
    - [Question Schema](#question-schema)
4. [Backend API Specification](#backend-api-specification)
    - [Authentication Endpoints](#authentication-endpoints)
    - [Process Guidelines Endpoints](#process-guidelines-endpoints)
    - [Progress Syncing Endpoints](#progress-syncing-endpoints)
    - [Document Verification Endpoints](#document-verification-endpoints)
    - [Citizen Forum & Tips Endpoints](#citizen-forum--tips-endpoints)
    - [Community Q&A Board Endpoints](#community-qa-board-endpoints)
5. [Frontend State Management & Syncing Pipeline](#frontend-state-management--syncing-pipeline)
    - [State Variables](#state-variables)
    - [Offline-First LocalStorage Fallback](#offline-first-localstorage-fallback)
    - [Debounced Server Syncing](#debounced-server-syncing)
    - [Session Progress Merging Flow](#session-progress-merging-flow)
6. [Security Controls & Hardening](#security-controls--hardening)
    - [Double-Cookie CSRF Protection](#double-cookie-csrf-protection)
    - [NoSQL Injection Defense](#nosql-injection-defense)
    - [Secure File Auditing & PII Cleanup](#secure-file-auditing--pii-cleanup)
    - [Secure JWT Sessions](#secure-jwt-sessions)
7. [Installation & Local Setup Manual](#installation--local-setup-manual)
    - [Prerequisites](#prerequisites)
    - [Environment Configuration](#environment-configuration)
    - [Setting Up MongoDB Atlas](#setting-up-mongodb-atlas)
    - [Acquiring a Google Gemini API Key](#acquiring-a-google-gemini-api-key)
    - [Running the Application](#running-the-application)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Future Extensions & Roadmap](#future-extensions--roadmap)

---

## Core Philosophy & Problem Statement

Applying for government documents in India often involves several common roadblocks for everyday citizens:
* **Information Fragmentation**: Guidelines, document requirements, and fee structures are scattered across multiple outdated portals.
* **Complex Guidelines**: Official rulebooks contain legal jargon that is difficult to interpret.
* **Unexpected Rejections**: Scans are often rejected due to minor mistakes (e.g. upload resolution, expiration states, or wrong document type), resulting in lost appointments and processing delays.
* **Vague Timelines**: Estimated durations listed on government portals do not reflect real-world waiting times at local centers.

CivicPilot solves this by bringing all instructions into a unified, digital notebook. It uses Google Gemini AI to analyze questions and check documents, and stores user progress and citizen feedback securely on MongoDB. This ensures that you always know what to prepare, where to apply, and what to expect.

---

## Detailed Feature Guide

### 1. Smart Intent Search & Process Finder
* **What it does**: Directs you to the correct checklist based on what you write.
* **User Flow**: You type a request in the search bar on the landing page (e.g., *"I want to start a restaurant"* or *"how do I apply for a driving license"*).
* **Technical Details**:
  * The frontend posts your search query to the backend `/api/discover` endpoint.
  * The backend sends your query to **Google Gemini 2.5 Flash** with instructions to classify the query into one of our supported process IDs (`passport`, `driving_license`, `gst_registration`, `business_registration`, `medical_store`, `restaurant`, `import_export_license`, `trade_license`, `fssai`, `shop_establishment`, `aadhaar`).
  * If a match is found, the system loads the process roadmap. If offline or no key is found, the backend falls back to keyword matching.

### 2. Step-by-Step Roadmap Checklists
* **What it does**: Provides a visual checklist of steps to complete your application.
* **User Flow**: Once you select a service, a notepad dashboard displays a checklist path.
* **Feature Breakdown**:
  * **Duration & Cost**: Shows how long a step takes and what you have to pay.
  * **Interactive Checklist**: Clicking a checkbox stamps the step as completed in your notebook.
  * **Direct Launch Portals**: If the step requires online action (e.g., TRN Generation on the GST Portal), a button links directly to the official government URL.
  * **Physical Location References**: If the step requires in-person visits (e.g., police verification), it guides you to the local station.

### 3. Interactive Eligibility Checkers
* **What it does**: Checks your qualifications before starting the application.
* **User Flow**: Under the **Eligibility** tab, the system displays yes/no questions (e.g., *"Have you resided in India for 182 days or more?"*).
* **Behavior**: If your answers match the expected rules, the system shows a success stamp. If an answer fails, it flags a warning showing the exact rule you missed.

### 4. AI-Powered Document Verification
* **What it does**: Checks scanned uploads to prevent rejections on official portals.
* **User Flow**: Under the **Documents** tab, you upload a scanned image or PDF of a document (e.g. Aadhaar or PAN).
* **Technical Details**:
  * The file is sent via multipart/form-data to `/api/verify-document`.
  * The server reads the file into a buffer and forwards it to Google Gemini AI along with auditing instructions.
  * Gemini reviews the document structure, flags blurriness or cropping, and checks for expiration dates or signatures.
  * It returns a structured JSON payload: `valid` (true/false), `status` (`success`/`warning`/`error`), and `feedback` (plain English summary).
  * The uploaded file is immediately deleted from the server to protect your privacy.

### 5. Document Expiry Renewal Vault
* **What it does**: Manages your active documents and alerts you before they expire.
* **User Flow**: Open **My Vault** in the navigation bar. You can add documents by entering the category, holder name, document number, and expiry date.
* **MongoDB Live Insights**:
  * The backend uses a **MongoDB Aggregation Pipeline** to calculate a **Vault Health Score**.
  * The pipeline unrolls the document array, converts expiry strings to dates, tagging items as `expired`, `critical` (expiring in under 30 days), or `warning` (expiring in under 90 days).
  * It returns the total document count, alert tallies, and the next expiring document.
  * Clicking **Renew** next to an alert instantly opens its roadmap checklist.

### 6. Citizen Forum: Tips & Experiences Feed
* **What it does**: Crowdsources real-world waiting times and tips for local offices.
* **User Flow**: Under the **Citizen Forum** tab, select *"Share My Experience"*. Enter the office name (e.g. *Begumpet PSK*), estimated processing days, star rating, and helpful advice.
* **MongoDB live aggregates**:
  * Submissions are stored in the `tips` collection.
  * The backend runs a MongoDB aggregation query (`$match` processId, followed by `$group` calculating `$avg` days, `$min` days, `$max` days, and `$sum` count).
  * The page calculates wait times based on actual citizen experiences rather than theoretical government timelines.

### 7. Community Q&A Board
* **What it does**: A forum to ask and resolve document guidelines questions.
* **User Flow**: In the lower section of the **Citizen Forum** tab, users post questions (e.g. *"Will minor passports require both parent PANs?"*).
* **Feature Details**:
  * **Index Searches**: A search bar lets you run fast queries over the title and content using a **MongoDB Text Index**.
  * **Categories**: Filter doubts by category (General, Documents, Fees, Timeline, Eligibility).
  * **Replies thread**: Logged-in users can write answers to other citizens' questions.
  * **Upvote arrays**: Citizens can upvote questions and answers. Upvoted user IDs are tracked in Mongoose arrays to prevent duplicate upvotes.

### 8. AI Sahayak Chat Assistant
* **What it does**: A floating chatbot that answers questions about government procedures.
* **User Flow**: Click **AI Sahayak** in the top navigation bar or next to a checklist step to open the assistant.
* **Technical Details**:
  * The chat assistant reads your current active process context and active step.
  * It sends your question, active guidelines context, and chat history to the Gemini API.
  * It answers in simple, easy-to-read terms.

### 9. Action Plan PDF Downloader
* **What it does**: Generates a PDF of your checklist to review offline.
* **User Flow**: Click **Download PDF** in the top navigation bar or dashboard header.
* **Technical Details**:
  * Uses `jspdf` and `html2canvas` in the browser to compile your roadmap checkmarks, document checklists, and eligibility logs.
  * Generates a clean PDF file using the notebook theme colors.

---

## Database Architecture & Schema Definitions

CivicPilot stores structured records on MongoDB. Below are the schema blueprints defined in Mongoose.

### User Schema
Stores login credentials and hash passwords.

* **File**: `server/models/User.js`
* **Structure**:
  ```javascript
  const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^[a-zA-Z0-9\-_]{3,30}$/
    },
    password: {
      type: String,
      required: true
    }
  }, { timestamps: true });
  ```

### Progress Schema
Stores user checkpoints, verified document states, and active vault items.

* **File**: `server/models/Progress.js`
* **Structure**:
  ```javascript
  const progressSchema = new mongoose.Schema({
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    completedSteps: {
      type: mongoose.Schema.Types.Mixed, // Object mapping step ID to boolean
      default: {}
    },
    verifiedDocs: {
      type: mongoose.Schema.Types.Mixed,  // Object mapping document name to verification state
      default: {}
    },
    activeJourneys: {
      type: [String],                     // List of active process IDs
      default: []
    },
    documentVault: {
      type: mongoose.Schema.Types.Mixed,  // Array of registered document objects
      default: []
    }
  }, { timestamps: true });
  ```

### Tip Schema
Stores crowdsourced experiences, processing times, and upvotes.

* **File**: `server/models/Tip.js`
* **Structure**:
  ```javascript
  const tipSchema = new mongoose.Schema({
    processId: {
      type: String,
      required: true,
      index: true
    },
    officeName: {
      type: String,
      required: true,
      trim: true
    },
    experienceText: {
      type: String,
      required: true,
      trim: true
    },
    estimatedDays: {
      type: Number,
      required: true,
      min: 0
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5
    },
    username: {
      type: String,
      default: "Citizen"
    },
    upvotes: {
      type: Number,
      default: 0
    },
    upvotedUsers: {
      type: [String],                     // User IDs or IP addresses that upvoted
      default: []
    }
  }, { timestamps: true });
  ```

### Question Schema
Stores community doubts, categories, upvotes, and replies.

* **File**: `server/models/Question.js`
* **Structure**:
  ```javascript
  const answerSchema = new mongoose.Schema({
    content: { type: String, required: true, trim: true },
    username: { type: String, default: "Citizen Expert" },
    userId: { type: String, required: true },
    upvotes: { type: Number, default: 0 },
    upvotedUsers: { type: [String], default: [] }
  }, { timestamps: true });

  const questionSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['General', 'Documents', 'Fees & Payments', 'Timeline', 'Eligibility'],
      default: 'General'
    },
    processId: { type: String, required: true, index: true },
    username: { type: String, default: "Citizen Helper" },
    userId: { type: String, required: true },
    upvotes: { type: Number, default: 0 },
    upvotedUsers: { type: [String], default: [] },
    answers: { type: [answerSchema], default: [] }
  }, { timestamps: true });

  // Text index on title and content to enable full-text queries
  questionSchema.index({ title: 'text', content: 'text' });
  ```

---

## Backend API Specification

The Express backend exposes endpoints mapped under `/api`.

### Authentication Endpoints

#### `POST /api/register`
* **Description**: Registers a new citizen user account.
* **Payload**:
  ```json
  { "username": "Amit12", "password": "securepassword123" }
  ```
* **Response (201)**:
  ```json
  { "success": true, "message": "User registered successfully." }
  ```

#### `POST /api/login`
* **Description**: Logs in a user, establishes cookies, and creates a CSRF token.
* **Payload**:
  ```json
  { "username": "Amit12", "password": "securepassword123" }
  ```
* **Response (200)**:
  ```json
  {
    "success": true,
    "user": { "userId": "user_id_string", "username": "Amit12" },
    "csrfToken": "generated_csrf_token_hex_string"
  }
  ```

#### `POST /api/logout`
* **Description**: Logs out the active user and clears session cookies.
* **Response (200)**:
  ```json
  { "success": true, "message": "Logged out successfully." }
  ```

---

### Process Guidelines Endpoints

#### `GET /api/processes`
* **Description**: Lists all supported process checklists.
* **Response (200)**: Array of process overview objects.

#### `GET /api/processes/:id`
* **Description**: Returns detailed guidelines, documents, steps, and eligibility rules for a specific process (e.g. `passport`).
* **Response (200)**: Process details JSON.

#### `POST /api/discover`
* **Description**: Classifies user search queries using Gemini.
* **Payload**:
  ```json
  { "query": "I want to open a restaurant" }
  ```
* **Response (200)**:
  ```json
  { "found": true, "process": { "id": "restaurant", "name": "Restaurant Business..." } }
  ```

---

### Progress Syncing Endpoints

#### `GET /api/progress`
* **Description**: Retrieves step progress, document states, and vault items for the authenticated user.
* **Headers**: Requires active cookie session.
* **Response (200)**:
  ```json
  {
    "userId": "user_id",
    "completedSteps": { "step1": true },
    "verifiedDocs": { "Aadhaar Card": true },
    "activeJourneys": ["passport"],
    "documentVault": []
  }
  ```

#### `POST /api/progress`
* **Description**: Syncs active dashboard checkmarks, documents, and vault logs to MongoDB.
* **Payload**:
  ```json
  {
    "completedSteps": { "step1": true },
    "verifiedDocs": { "Aadhaar Card": true },
    "activeJourneys": ["passport"],
    "documentVault": []
  }
  ```
* **Response (200)**: Saved progress state.

---

### Document Verification Endpoints

#### `POST /api/verify-document`
* **Description**: Checks document scans using Gemini.
* **Payload**: Multipart file upload under `document` parameter and `docName` text field.
* **Response (200)**:
  ```json
  {
    "valid": true,
    "status": "success",
    "feedback": "Aadhaar Card verified successfully."
  }
  ```

---

### Citizen Forum & Tips Endpoints

#### `GET /api/tips/:processId`
* **Description**: Retrieves experiences and runs the MongoDB wait-time aggregation query.
* **Response (200)**:
  ```json
  {
    "stats": { "avgDays": 12.5, "totalReviews": 8, "minDays": 7, "maxDays": 21 },
    "tips": [ ... ]
  }
  ```

#### `POST /api/tips`
* **Description**: Logs a new citizen tip.
* **Payload**:
  ```json
  {
    "processId": "passport",
    "officeName": "Secunderabad PSK",
    "experienceText": "Counters open early.",
    "estimatedDays": 14,
    "rating": 5
  }
  ```
* **Response (201)**: Created tip object.

#### `POST /api/tips/:tipId/upvote`
* **Description**: Upvotes a tip. Upvotes are limited to one per user session.
* **Response (200)**: `{ "success": true, "upvotes": 12 }`

---

### Community Q&A Board Endpoints

#### `GET /api/questions`
* **Description**: Lists doubts for a process. Supports filters for search queries, categories, and sorting.
* **Query Parameters**: `processId`, `category`, `search`, `sort`
* **Response (200)**: Array of question documents.

#### `POST /api/questions`
* **Description**: Posts a new question.
* **Payload**:
  ```json
  {
    "title": "Aadhaar address update window",
    "content": "Will a rent agreement work?",
    "category": "Documents",
    "processId": "passport"
  }
  ```

#### `POST /api/questions/:questionId/answers`
* **Description**: Submits a reply to a question.
* **Payload**: `{ "content": "Yes, but make sure it has a stamp." }`

#### `POST /api/questions/:questionId/upvote`
* **Description**: Upvotes a question.
* **Response (200)**: `{ "success": true, "upvotes": 5 }`

---

## Frontend State Management & Syncing Pipeline

CivicPilot is designed with an offline-first state approach, syncing with the MongoDB server whenever a network connection is available and the user is logged in.

### State Variables
The core application state resides in [App.jsx](file:///home/faddu/CivicPilot/client/src/App.jsx):
* `completedSteps`: Keeps track of checkmarks on the steps.
* `verifiedDocs`: Tracks which documents passed verification.
* `activeJourneys`: Maintains the list of services currently tracked by the user.
* `documentVault`: Holds your registered documents.
* `currentUser`: Set to user details upon login; null if running in guest mode.
* `csrfToken`: Security token retrieved from the backend.

### Offline-First LocalStorage Fallback
* When using the application as a guest (without logging in), all state updates are saved to `localStorage` (e.g. `civicpilot_completed_steps`, `civicpilot_document_vault`).
* This ensures that if you refresh the browser, close the tab, or go offline, your checklists and vault details remain saved.

### Debounced Server Syncing
* When you log in, CivicPilot synchronizes your state with MongoDB.
* To prevent flooding the database with requests every time you click a checkmark, the synchronization hook uses a **500ms debounce**.
* The system waits until you pause clicking before bundling the updates and sending them to `/api/progress`.

### Session Progress Merging Flow
When a guest logs in to an account, CivicPilot merges their local guest progress with their server-saved progress:
1. It downloads the progress payload from the server.
2. It combines checking records (if you checked a step as a guest, it marks it checked on the server too).
3. It combines the local document vault list with the server vault list, filtering out duplicates based on the document ID.
4. It saves the combined state back to MongoDB and updates the browser view.

---

## Security Controls & Hardening

CivicPilot enforces strict security practices to keep user data safe.

### Double-Cookie CSRF Protection
To prevent Cross-Site Request Forgery:
1. The backend generates a random token on user login and sets it in an HTTP cookie named `csrf-token`.
2. The frontend reads this cookie and attaches the token to the request headers under `X-CSRF-Token` for any modifying requests (`POST`, `PUT`, `DELETE`).
3. The server compares the header value with the cookie value. If they do not match, it blocks the request.

### NoSQL Injection Defense
To prevent malicious database queries:
* Schema input validation is enforced using Mongoose validator middleware.
* User IDs and Process IDs are validated against strict regex limits (`/^[a-zA-Z0-9\-_]{2,100}$/`).
* Standard inputs are sanitized to prevent nested object injection.

### Secure File Auditing & PII Cleanup
To prevent leaks of Personally Identifiable Information (PII):
* When you upload documents for verification, files are processed using stream pipelines.
* The file is sent to Gemini, analyzed in-memory, and the temporary file is immediately deleted from the server using `fs.unlinkSync`. CivicPilot never stores your private document files on disk.

### Secure JWT Sessions
* Session cookies use the `HttpOnly` and `SameSite: Lax` flags. This blocks scripts from reading your session cookies, protecting against Cross-Site Scripting (XSS) attacks.

---

## Installation & Local Setup Manual

Follow these steps to run CivicPilot on your computer.

### Prerequisites
1. Install **Node.js** (Version 18+).
2. Set up a **MongoDB** connection string.
3. Obtain a **Google Gemini API Key**.

---

### Environment Configuration

Create a file named `.env` in the root folder of the project (`/home/faddu/CivicPilot/.env`) and add the following keys:

```env
# Google Gemini API credentials
GEMINI_API_KEY=your_gemini_api_key_here

# Local server details
PORT=5000
HOST=127.0.0.1

# MongoDB Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/database_name

# JSON Web Token Secret Password
JWT_SECRET=generate_a_random_long_secret_key_string
```

---

### Setting Up MongoDB Atlas
If you don't have a local database, follow these steps to set up a free cloud database:
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up.
2. Create a new Free Shared Cluster.
3. Go to **Database Access** under Security and create a database user with a username and password.
4. Go to **Network Access** and select *"Allow Access from Anywhere"* (or add your IP address).
5. Click **Connect**, choose *"Connect your application"*, and copy the connection string.
6. Replace `<password>` in the connection string with your database user's password, and paste it into the `MONGODB_URI` field in your `.env` file.

---

### Acquiring a Google Gemini API Key
To use the document verification and chat features:
1. Visit the [Google AI Studio](https://aistudio.google.com/).
2. Log in with your Google account.
3. Click **Get API Key** and create a new key.
4. Copy the key and paste it into the `GEMINI_API_KEY` field in your `.env` file.

---

### Running the Application

1. **Install Server Dependencies**:
   ```bash
   cd server
   npm install
   ```
2. **Install Client Dependencies**:
   ```bash
   cd ../client
   npm install
   ```
3. **Start the Backend Server**:
   ```bash
   cd ../server
   npm start
   ```
   *The server console should log: "Successfully connected to MongoDB" and listen on port 5000.*
4. **Start the Frontend Client**:
   Open a new terminal window and run:
   ```bash
   cd client
   npm run dev
   ```
5. **Access the Web App**:
   Open your browser and navigate to `http://127.0.0.1:5173`.

---

## Troubleshooting Guide

### 1. "Failed to fetch" or "Could not connect to database" on Q&A or Tips
* **Reason**: The backend server is not running, or your database connection string is incorrect.
* **Solution**: Check the terminal logs for `npm start`. Make sure it prints *"Successfully connected to MongoDB"*. Ensure that your local IP address is allowed in your MongoDB Atlas Network Access configuration.

### 2. "CSRF Token Mismatch" or "Verification failed" during POST operations
* **Reason**: The frontend did not receive or send the `X-CSRF-Token` header, or the session cookie expired.
* **Solution**: Log out and log back in to refresh the cookies, or check that your browser is allowing local cookies.

### 3. Document Verification is slow or returns warnings
* **Reason**: The Gemini API key is missing, or the API limits are reached.
* **Solution**: Verify that `GEMINI_API_KEY` is set in your `.env` file. If the key is missing, the backend falls back to offline stubs to prevent crashes.

### 4. Port 5000 is already in use
* **Reason**: Another process is using port 5000.
* **Solution**: Run `kill $(lsof -t -i:5000)` to free the port, or change the `PORT` key inside the `.env` file.

---

## Future Extensions & Roadmap

Below are planned features for future versions of CivicPilot:
* **Interactive Document Mock Filler**: An interactive helper sheet that shows you a sample form (e.g. Form 1A for Medical Certificates) and helps you practice filling it out.
* **State Selection Filters**: Filter guidelines automatically based on the selected state (e.g. MeeSeva rules for Telangana vs. Sakala rules for Karnataka).
* **Automated Expiry Push Notifications**: Send email or mobile alerts when a document in your vault is within 30 days of expiring.
* **Official API Integrations**: Integrate verified third-party API lookups for real-world tracking checkmarks where CAPTCHA is not required.
