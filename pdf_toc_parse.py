import pymupdf  # PyMuPDF
import sys
import json
import os
import uuid

#get_toc()값이 없을 경우 heading 기반으로 toc 추정함
def guess_pdf_headings(doc):
    titles = []
    for i in range(len(doc)):
        blocks = doc.load_page(i).get_text("dict")["blocks"]
        for block in blocks:
            for line in block.get("lines", []):
                spans = line.get("spans", [])
                if not spans:
                    continue
                text = " ".join([span["text"] for span in spans]).strip()
                font_size = spans[0]["size"]
                if font_size > 12 and 5 < len(text) < 100:
                    titles.append((text, i + 1))
    guessed_toc = [(1, title, page) for title, page in titles] #레벨 1로 고정함
    return guessed_toc

def extract_pdf_info(file_path):
    doc = pymupdf.open(file_path)
    toc = doc.get_toc()
    if not toc:
        toc = guess_pdf_headings(doc)

    structured = []
    id_map = {}  # title -> item
    stack = []   # 계층 추적을 위한 스택

    for level, title, page in toc:
        node = {
            "id": str(uuid.uuid4()),
            "level": level,
            "title": title,
            "page": page,
            "subKeywords": [],
            "parentId": None,
            "fileName": file_path.split("/")[-1],
        }

        # 현재 계층보다 위의 항목은 제거 (스택 정리)
        while stack and stack[-1]["level"] >= level:
            stack.pop()

        if stack:
            parent = stack[-1]
            node["parentId"] = parent["id"]
            parent["subKeywords"].append(node["id"])

        else:
            structured.append(node)

        stack.append(node)
        id_map[node["id"]] = node

    # 평탄화된 리스트 추출
    all_nodes = list(id_map.values())

    print(json.dumps(all_nodes, ensure_ascii=False, indent=2))
    doc.close()

if __name__ == "__main__":
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    directory = os.path.join(BASE_DIR, 'static')

    if len(sys.argv) < 2:
        print("❗ 사용법: python pdf_toc_parse.py <파일경로>")
    else:
        extract_pdf_info(sys.argv[1])