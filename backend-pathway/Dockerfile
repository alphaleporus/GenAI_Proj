FROM python:3.11-slim

LABEL maintainer="FleetFusion Team"
LABEL description="Pathway-based supply chain monitoring backend"

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements-pathway.txt /app/

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements-pathway.txt

# Copy application code
COPY connectors/ /app/connectors/
COPY transformations/ /app/transformations/
COPY llm/ /app/llm/
COPY adapters/ /app/adapters/
COPY data/ /app/data/
COPY main.py /app/
COPY websocket_server.py /app/

# Create output directory
RUN mkdir -p /app/output

# Expose WebSocket port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import os; exit(0 if os.path.exists('output/truck_status.jsonl') else 1)"

# Run both pipeline and WebSocket server
CMD python main.py & \
    sleep 10 && \
    python websocket_server.py
