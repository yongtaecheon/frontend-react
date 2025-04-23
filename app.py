from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import fitz
import os
from werkzeug.utils import secure_filename
import json

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
DOCUMENTS_FILE = os.path.join(BASE_DIR, 'documents.json')

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def load_documents():
    if os.path.exists(DOCUMENTS_FILE):
        with open(DOCUMENTS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_documents(documents):
    with open(DOCUMENTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(documents, f, ensure_ascii=False, indent=2)

@app.route('/api/documents', methods=['GET'])
def get_documents():
    documents = load_documents()
    return jsonify(documents)

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and file.filename.endswith('.pdf'):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)

        # --- Check for duplicates BEFORE saving the file --- 
        #     (Optional: Save disk space by not re-saving the file if it exists,
        #      but for simplicity, we'll re-save for now and just prevent DB duplication)
        file.save(filepath) 

        # Extract TOC from PDF
        try:
            doc = fitz.open(filepath)
            toc = doc.get_toc()
            doc.close()
        except Exception as e:
            print(f"Error processing PDF {filename}: {e}")
            # Optionally remove the saved file if processing failed
            # os.remove(filepath)
            return jsonify({'error': 'Error processing PDF file'}), 500

        # Format TOC for frontend
        formatted_toc = []
        for level, title, page in toc:
            formatted_toc.append({
                'level': level,
                'title': title,
                'page': page
            })

        # --- Check for duplicates BEFORE saving document metadata --- 
        documents = load_documents()
        is_duplicate = any(doc['filename'] == filename for doc in documents)

        if not is_duplicate:
            # Save document information ONLY if it's not a duplicate
            documents.append({
                'filename': filename,
                'title': os.path.splitext(filename)[0], # Use filename without extension as title
                'toc': formatted_toc
            })
            save_documents(documents)
            print(f"Added new document: {filename}") # Log addition
        else:
            print(f"Duplicate document upload ignored: {filename}") # Log ignore

        # Always return the TOC of the uploaded file for immediate viewing
        return jsonify({
            'filename': filename, # Return the filename for the frontend to potentially use
            'toc': formatted_toc
        })

    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/documents/<filename>', methods=['PUT'])
def update_document(filename):
    try:
        data = request.json
        if not data or 'title' not in data:
            return jsonify({'error': 'Title is required'}), 400
        
        new_title = data['title']
        if not new_title.strip():
            return jsonify({'error': 'Title cannot be empty'}), 400
        
        documents = load_documents()
        document_found = False
        
        for doc in documents:
            if doc['filename'] == filename:
                doc['title'] = new_title
                document_found = True
                break
        
        if not document_found:
            return jsonify({'error': 'Document not found'}), 404
        
        save_documents(documents)
        return jsonify({'message': 'Document updated successfully'}), 200
    
    except Exception as e:
        print(f"Error updating document: {e}")
        return jsonify({'error': 'Error updating document'}), 500

@app.route('/api/documents/<filename>', methods=['DELETE'])
def delete_document(filename):
    try:
        documents = load_documents()
        document_found = False
        updated_documents = []
        
        for doc in documents:
            if doc['filename'] == filename:
                document_found = True
                # 파일 시스템에서 PDF 파일 삭제
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                if os.path.exists(file_path):
                    os.remove(file_path)
            else:
                updated_documents.append(doc)
        
        if not document_found:
            return jsonify({'error': 'Document not found'}), 404
        
        save_documents(updated_documents)
        return jsonify({'message': 'Document deleted successfully'}), 200
    
    except Exception as e:
        print(f"Error deleting document: {e}")
        return jsonify({'error': 'Error deleting document'}), 500

if __name__ == '__main__':
    app.run(port= 8000, debug=True) 