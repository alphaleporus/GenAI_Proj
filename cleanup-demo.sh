#!/bin/bash

################################################################################
# FleetFusion Demo Cleanup Script
# Stops all running demo services and cleans up artifacts
################################################################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo -e "${YELLOW}🧹 Cleaning up FleetFusion Demo${NC}"
echo ""

# Kill processes by PID file
if [ -f ".demo-pids" ]; then
    echo -e "${GREEN}▶${NC} Stopping processes from .demo-pids..."
    while read pid; do
        if ps -p $pid > /dev/null 2>&1; then
            echo -e "  ${GREEN}✓${NC} Killing process $pid"
            kill $pid 2>/dev/null || kill -9 $pid 2>/dev/null || true
        fi
    done < ".demo-pids"
    rm ".demo-pids"
else
    echo -e "${YELLOW}⚠${NC} No .demo-pids file found"
fi

# Kill by process name (fallback)
echo ""
echo -e "${GREEN}▶${NC} Searching for FleetFusion processes..."

if pgrep -f "python main.py" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} Killing Pathway pipeline..."
    pkill -f "python main.py" || pkill -9 -f "python main.py" || true
fi

if pgrep -f "python websocket_server.py" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} Killing WebSocket server..."
    pkill -f "python websocket_server.py" || pkill -9 -f "python websocket_server.py" || true
fi

if pgrep -f "next dev" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} Killing Next.js frontend..."
    pkill -f "next dev" || pkill -9 -f "next dev" || true
fi

# Kill by port (extra thorough)
echo ""
echo -e "${GREEN}▶${NC} Checking ports..."

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} Freeing port 3000 (Frontend)..."
    lsof -Pi :3000 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
fi

if lsof -Pi :8765 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} Freeing port 8765 (WebSocket)..."
    lsof -Pi :8765 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
fi

if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "  ${YELLOW}⚠${NC} Port 8080 is in use (may be from old config)"
    echo -e "      Run: lsof -i :8080 to check what's using it"
fi

# Wait a moment for processes to die
sleep 1

# Verify cleanup
echo ""
echo -e "${GREEN}▶${NC} Verifying cleanup..."

STILL_RUNNING=false

if pgrep -f "python main.py" > /dev/null 2>&1 || \
   pgrep -f "python websocket_server.py" > /dev/null 2>&1 || \
   pgrep -f "next dev" > /dev/null 2>&1; then
    echo -e "  ${RED}✗${NC} Some processes are still running"
    STILL_RUNNING=true
else
    echo -e "  ${GREEN}✓${NC} All FleetFusion processes stopped"
fi

echo ""
if [ "$STILL_RUNNING" = true ]; then
    echo -e "${YELLOW}⚠${NC} Some processes couldn't be killed. Try:"
    echo -e "    ${GREEN}sudo ./cleanup-demo.sh${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Demo cleanup complete!${NC}"
    echo ""
    echo -e "You can now run: ${GREEN}./start-demo.sh${NC}"
    exit 0
fi
