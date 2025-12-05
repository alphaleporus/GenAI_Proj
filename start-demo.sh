#!/bin/bash

################################################################################
# FleetFusion Demo Launcher
# Starts all services needed for a complete demo
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# PID file to track processes
PIDFILE=".demo-pids"

################################################################################
# Helper Functions
################################################################################

print_header() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_step() {
    echo -e "${PURPLE}▶${NC} $1"
}

cleanup() {
    echo ""
    print_header "Shutting Down FleetFusion Demo"
    
    if [ -f "$PIDFILE" ]; then
        print_step "Stopping all processes..."
        while read pid; do
            if ps -p $pid > /dev/null 2>&1; then
                print_info "Killing process $pid"
                kill $pid 2>/dev/null || true
            fi
        done < "$PIDFILE"
        rm "$PIDFILE"
        print_success "All processes stopped"
    fi
    
    print_info "Demo stopped. Thank you for using FleetFusion! 🚀"
    exit 0
}

# Trap Ctrl+C and cleanup
trap cleanup SIGINT SIGTERM

check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is not installed"
        return 1
    fi
    return 0
}

################################################################################
# Pre-flight Checks
################################################################################

print_header "🚀 FleetFusion Demo Launcher"

print_step "Running pre-flight checks..."

# Check Node.js
if check_command node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js installed: $NODE_VERSION"
else
    print_error "Node.js is required but not installed"
    exit 1
fi

# Check Python
if check_command python3; then
    PYTHON_VERSION=$(python3 --version)
    print_success "Python installed: $PYTHON_VERSION"
else
    print_error "Python 3 is required but not installed"
    exit 1
fi

# Check npm
if check_command npm; then
    NPM_VERSION=$(npm --version)
    print_success "npm installed: v$NPM_VERSION"
else
    print_error "npm is required but not installed"
    exit 1
fi

################################################################################
# Check Dependencies
################################################################################

print_step "Checking dependencies..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found. Installing frontend dependencies..."
    npm install
    print_success "Frontend dependencies installed"
else
    print_success "Frontend dependencies found"
fi

# Check if Python virtual environment exists
if [ ! -d "backend-pathway/venv-pathway" ]; then
    print_warning "Python virtual environment not found. Creating..."
    cd backend-pathway
    python3 -m venv venv-pathway
    source venv-pathway/bin/activate
    pip install -r requirements-pathway.txt
    cd ..
    print_success "Python virtual environment created"
else
    print_success "Python virtual environment found"
fi

################################################################################
# Environment Setup
################################################################################

print_step "Checking environment configuration..."

# Check for OpenAI API key
if [ ! -f "backend-pathway/.env" ]; then
    print_warning "No .env file found in backend-pathway/"
    print_info "Creating .env file (you may need to add your OpenAI API key later)"
    echo "# OpenAI API Key (required for AI features)" > backend-pathway/.env
    echo "OPENAI_API_KEY=your_key_here" >> backend-pathway/.env
    echo "" >> backend-pathway/.env
    echo "# WebSocket Configuration" >> backend-pathway/.env
    echo "WEBSOCKET_PORT=8765" >> backend-pathway/.env
    echo "WEBSOCKET_HOST=localhost" >> backend-pathway/.env
fi

# Check if OpenAI key is set
if grep -q "your_key_here" backend-pathway/.env 2>/dev/null; then
    print_warning "OpenAI API key not configured in backend-pathway/.env"
    print_info "AI features may not work without a valid API key"
fi

################################################################################
# Start Services
################################################################################

print_header "Starting Services"

# Clean up old PID file
rm -f "$PIDFILE"

# Check for port conflicts and clean them up
print_step "Checking for port conflicts..."

# Check if port 3000 (Frontend) is in use
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "Port 3000 is already in use. Attempting to free it..."
    lsof -Pi :3000 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# Check if port 8765 (WebSocket) is in use
if lsof -Pi :8765 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "Port 8765 is already in use. Attempting to free it..."
    lsof -Pi :8765 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# Kill any existing FleetFusion processes
print_step "Cleaning up any existing FleetFusion processes..."
pkill -f "python main.py" 2>/dev/null || true
pkill -f "python websocket_server.py" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
sleep 2

print_step "Starting Backend Services..."
echo ""

# Start Pathway Pipeline
print_info "Starting Pathway Streaming Pipeline..."
cd backend-pathway
source venv-pathway/bin/activate

# Start main pipeline in background
python main.py > ../logs/pathway.log 2>&1 &
PATHWAY_PID=$!
echo $PATHWAY_PID >> "../$PIDFILE"
cd ..

sleep 2

if ps -p $PATHWAY_PID > /dev/null; then
    print_success "Pathway Pipeline started (PID: $PATHWAY_PID)"
else
    print_error "Failed to start Pathway Pipeline"
    cat logs/pathway.log
    exit 1
fi

# Start WebSocket Server
print_info "Starting WebSocket Server..."
cd backend-pathway
python websocket_server.py > ../logs/websocket.log 2>&1 &
WEBSOCKET_PID=$!
echo $WEBSOCKET_PID >> "../$PIDFILE"
cd ..

sleep 2

if ps -p $WEBSOCKET_PID > /dev/null; then
    print_success "WebSocket Server started (PID: $WEBSOCKET_PID)"
else
    print_error "Failed to start WebSocket Server"
    cat logs/websocket.log
    exit 1
fi

echo ""
print_step "Starting Frontend..."
echo ""

# Start Next.js Frontend
print_info "Starting Next.js Development Server..."
npm run dev > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID >> "$PIDFILE"

sleep 5

if ps -p $FRONTEND_PID > /dev/null; then
    print_success "Frontend started (PID: $FRONTEND_PID)"
else
    print_error "Failed to start Frontend"
    cat logs/frontend.log
    exit 1
fi

################################################################################
# Demo Ready
################################################################################

print_header "🎉 FleetFusion Demo is Running!"

echo ""
print_success "All services started successfully!"
echo ""
print_info "Access Points:"
echo "   • Frontend:        ${CYAN}http://localhost:3000${NC}"
echo "   • Dashboard:       ${CYAN}http://localhost:3000/dashboard${NC}"
echo "   • Analytics:       ${CYAN}http://localhost:3000/analytics${NC}"
echo "   • WebSocket:       ${CYAN}ws://localhost:8765${NC}"
echo ""
print_info "Log Files:"
echo "   • Pathway:         ${YELLOW}logs/pathway.log${NC}"
echo "   • WebSocket:       ${YELLOW}logs/websocket.log${NC}"
echo "   • Frontend:        ${YELLOW}logs/frontend.log${NC}"
echo ""
print_info "Running Processes:"
echo "   • Pathway Pipeline:  PID $PATHWAY_PID"
echo "   • WebSocket Server:  PID $WEBSOCKET_PID"
echo "   • Next.js Frontend:  PID $FRONTEND_PID"
echo ""
print_warning "Press ${RED}Ctrl+C${NC} to stop all services"
echo ""

print_header "Demo Instructions"
echo ""
echo "1. Open your browser and go to ${CYAN}http://localhost:3000${NC}"
echo "2. Click 'Launch FleetFusion' to access the dashboard"
echo "3. Watch the live map with real-time truck tracking"
echo "4. Observe delay detection and arbitrage opportunities"
echo "5. Check the Agent Stream for real-time events"
echo ""
echo "Enjoy the demo! 🚀"
echo ""

################################################################################
# Monitor Services
################################################################################

print_step "Monitoring services... (logs updating in real-time)"
echo ""

# Keep script running and show periodic status
while true; do
    sleep 30
    
    # Check if all processes are still running
    ALL_RUNNING=true
    
    if ! ps -p $PATHWAY_PID > /dev/null 2>&1; then
        print_error "Pathway Pipeline stopped unexpectedly!"
        ALL_RUNNING=false
    fi
    
    if ! ps -p $WEBSOCKET_PID > /dev/null 2>&1; then
        print_error "WebSocket Server stopped unexpectedly!"
        ALL_RUNNING=false
    fi
    
    if ! ps -p $FRONTEND_PID > /dev/null 2>&1; then
        print_error "Frontend stopped unexpectedly!"
        ALL_RUNNING=false
    fi
    
    if [ "$ALL_RUNNING" = false ]; then
        print_error "One or more services crashed. Check log files."
        cleanup
        exit 1
    fi
done
