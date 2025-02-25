FROM python:3.9-slim

RUN apt-get update && apt-get install -y \
    libxml2 \
    libxslt1.1 \
    libxslt-dev \
    gcc \
    libffi-dev \
    graphviz \
    libjpeg-dev \
    zlib1g-dev \
    && apt-get clean

RUN apt-get install -y \
    poppler-utils \
    tesseract-ocr \
    && apt-get clean

WORKDIR /app

COPY requirements.txt /app/

RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/

EXPOSE 8000

ENV PYTHONUNBUFFERED=1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
