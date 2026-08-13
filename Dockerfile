FROM python:3.11-slim

WORKDIR /app

# Install system compilation packages
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Establish default workspace data folders
RUN mkdir -p Data/pdfs Data/text Data/images Data/weburls vectorstore

EXPOSE 8085
EXPOSE 8501

CMD ["python", "main.py"]
