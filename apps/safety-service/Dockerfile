FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir fastapi uvicorn[standard] httpx python-dotenv pydantic websockets
COPY . .
ENV SAFETY_SERVICE_PORT=3012
EXPOSE 3012
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3012"]
