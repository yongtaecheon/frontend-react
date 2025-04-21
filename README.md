# PDF Table of Contents Viewer

A web application that allows users to upload PDF documents and view their table of contents in a tree structure alongside the PDF viewer.

## Features

- PDF file upload
- Automatic table of contents extraction
- Three-column layout:
  - Left: File upload and TOC
  - Center: PDF viewer
  - Right: TOC navigation
- Interactive TOC navigation

## Prerequisites

- Python 3.7+
- Node.js 14+
- npm or yarn

## Setup

1. Clone the repository
2. Set up the backend:
   ```bash
   # Create and activate virtual environment
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Unix/MacOS:
   source venv/bin/activate

   # Install dependencies
   pip install -r requirements.txt
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   ```

## Running the Application

1. Start the backend server:
   ```bash
   # From the root directory
   python app.py
   ```

2. Start the frontend development server:
   ```bash
   # From the frontend directory
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Click the file input in the left panel to upload a PDF file
2. The table of contents will be automatically extracted and displayed
3. Click on any TOC item to navigate to that section in the PDF
4. Use the PDF viewer in the center panel to read the document

## Project Structure

```
.
├── app.py              # Flask backend server
├── requirements.txt    # Python dependencies
├── frontend/          # React frontend
│   ├── package.json
│   └── src/
│       ├── App.js
│       └── App.css
└── uploads/           # Directory for uploaded PDFs
```

## Technologies Used

- Backend: Python, Flask, PyMuPDF
- Frontend: React, react-pdf, axios