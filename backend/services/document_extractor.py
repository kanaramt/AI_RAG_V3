from pathlib import Path

from fastapi import HTTPException, UploadFile


class DocumentExtractor:
    """
    Extracts text from uploaded documents.

    We will add support gradually for:
    - TXT
    - PDF
    - DOCX
    - CSV
    - XLSX
    - PPTX
    - Images (OCR)
    """

    @classmethod
    async def extract_text(cls, file: UploadFile) -> str:

        extension = Path(file.filename).suffix.lower()

        if extension == ".txt":
            return await cls._extract_txt(file)
            
        elif extension == ".pdf":
            return await cls._extract_pdf(file)
            
        elif extension == ".csv":
            return await cls._extract_csv(file)
            
        elif extension == ".json":
            return await cls._extract_json(file)

        raise HTTPException(
            status_code=400,
            detail=f"No extractor available for '{extension}' files."
        )

    @staticmethod
    async def _extract_json(file: UploadFile) -> str:
        """
        Extract readable text from a JSON file.
        """
        import json
        contents = await file.read()
        await file.seek(0)
        try:
            data = json.loads(contents.decode("utf-8"))
            if isinstance(data, dict):
                parts = []
                for k, v in data.items():
                    if isinstance(v, (str, int, float, list)):
                        parts.append(f"{k}: {v}")
                return "\n".join(parts)
            elif isinstance(data, list):
                if len(data) > 0 and isinstance(data[0], dict) and ("content" in data[0] or "url" in data[0]):
                    text_parts = []
                    for item in data:
                        title = item.get("title", "Untitled Page")
                        url = item.get("url", "")
                        content = item.get("content", "")
                        text_parts.append(f"Title: {title}\nURL: {url}\nContent:\n{content}\n")
                    return "\n---\n".join(text_parts)
                return "\n".join(str(item) for item in data)
            return json.dumps(data, indent=2)
        except Exception:
            return contents.decode("utf-8", errors="ignore")


    @staticmethod
    async def _extract_txt(file: UploadFile) -> str:
        """
        Extract text from a TXT file.
        """

        contents = await file.read()

        await file.seek(0)

        return contents.decode("utf-8")

    @staticmethod
    async def _extract_pdf(file: UploadFile) -> str:
        """
        Extract text from a PDF file using pypdf.
        """
        import io
        import pypdf

        contents = await file.read()
        await file.seek(0)

        reader = pypdf.PdfReader(io.BytesIO(contents))
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text

    @staticmethod
    async def _extract_csv(file: UploadFile) -> str:
        """
        Extract text from a CSV file.
        """
        import io
        import csv

        contents = await file.read()
        await file.seek(0)

        try:
            decoded = contents.decode("utf-8")
        except UnicodeDecodeError:
            decoded = contents.decode("latin-1")

        reader = csv.reader(io.StringIO(decoded))
        text_lines = []
        for row in reader:
            if row:
                text_lines.append(", ".join(row))
        return "\n".join(text_lines)