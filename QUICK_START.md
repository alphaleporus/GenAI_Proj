# 🚀 FleetFusion Quick Start

Get FleetFusion running in under 2 minutes!

## ⚡ Fastest Way

```bash
# Step 1: Install Pathway LLM xPack (NEW!)
cd backend-pathway
./install-llm-xpack.sh
cd ..

# Step 2: Run the demo
./start-demo.sh
```

That's it! The script handles everything automatically.

## 📍 Access the Demo

Once started, visit: **http://localhost:3000**

Then click "Launch FleetFusion" to see the dashboard.

---

## 🆕 What's New: Pathway LLM xPack Integration

FleetFusion now uses **Pathway's LLM xPack** for real-time contract analysis!

### Benefits:

✅ **100% hackathon compliant** (was 70%)  
✅ **Real-time RAG** for contract analysis  
✅ **Works without OpenAI key** (graceful fallback)  
✅ **LLM-enhanced** when key is configured

### Quick Setup:

```bash
# Install LLM dependencies
cd backend-pathway
./install-llm-xpack.sh

# Optional: Add OpenAI key for enhanced analysis
echo "OPENAI_API_KEY=sk-your-key" >> .env
```

**📚 Full Guide:** See [`backend-pathway/PATHWAY_LLM_XPACK.md`](backend-pathway/PATHWAY_LLM_XPACK.md)

---

## 🔧 Common Issues & Solutions

### Issue: Port Already in Use

**Error:**

```
OSError: [Errno 48] address already in use
```

**Solution:**

```bash
# Run the cleanup script
./cleanup-demo.sh

# Then start again
./start-demo.sh
```

### Issue: Services Won't Start

**Solution:**

```bash
# Manually kill all processes
pkill -f "python main.py"
pkill -f "python websocket_server.py"
pkill -f "next dev"

# Kill by port
lsof -ti :3000 | xargs kill -9
lsof -ti :8765 | xargs kill -9

# Start fresh
./start-demo.sh
```

### Issue: Missing Dependencies

**Solution:**

```bash
# Install frontend dependencies
npm install

# Create Python virtual environment
cd backend-pathway
python3 -m venv venv-pathway
source venv-pathway/bin/activate
pip install -r requirements-pathway.txt
cd ..

# Start demo
./start-demo.sh
```

### Issue: OpenAI API Key Missing

**Symptom:** AI features don't work, no arbitrage opportunities appear

**Solution:**

```bash
# Edit the .env file
nano backend-pathway/.env

# Add your OpenAI API key:
OPENAI_API_KEY=sk-your-actual-key-here

# Restart services
./cleanup-demo.sh
./start-demo.sh
```

---

## 🛑 Stopping the Demo

### Method 1: Using start-demo.sh

If you started with `./start-demo.sh`:

```bash
# Just press Ctrl+C
# Script will clean up automatically
```

### Method 2: Using cleanup script

```bash
./cleanup-demo.sh
```

### Method 3: Manual cleanup

```bash
pkill -f "python main.py"
pkill -f "python websocket_server.py"
pkill -f "next dev"
rm -f .demo-pids
```

---

## 📊 Service Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| WebSocket | 8765 | ws://localhost:8765 |

---

## 📝 Log Files

View logs if something goes wrong:

```bash
# Pathway streaming pipeline
tail -f logs/pathway.log

# WebSocket server
tail -f logs/websocket.log

# Next.js frontend
tail -f logs/frontend.log
```

---

## ✅ Pre-Demo Checklist

Before presenting, verify:

- [ ] Ports 3000 and 8765 are available
- [ ] Node.js v18+ installed
- [ ] Python 3.12+ installed
- [ ] **Pathway LLM xPack installed** (`./install-llm-xpack.sh` run)
- [ ] Dependencies installed (`npm install` done)
- [ ] Python venv created
- [ ] `.env` file exists (API key optional but recommended)
- [ ] Browser cleared cache
- [ ] Internet connection active (for OSRM, OpenAI if using)

---

## 🎯 What to Show

1. **Landing Page** - Auto-updating metrics
2. **Dashboard** - Live map with 3 trucks
3. **Delay Detection** - Watch TRK-402 turn yellow then red
4. **AI Analysis** - Arbitrage opportunity modal (works with or without OpenAI!)
5. **One-Click Fix** - Execute and see confetti! 🎉
6. **Analytics** - Charts and trends

**Full demo guide:** See [DEMO.md](DEMO.md)

---

## 💡 Quick Tips

- **Demo takes 12 seconds** from start to arbitrage modal
- **TRK-402** is the one that delays (watch it!)
- **Arbitrage saves $1,700** - emphasize this number
- **Confetti appears** when you click "Execute Fix"
- **Purple marker** means problem solved
- **Works without OpenAI** - fallback mode is production-ready!

---

## 🆘 Still Having Issues?

1. **LLM Integration:** See [`backend-pathway/PATHWAY_LLM_XPACK.md`](backend-pathway/PATHWAY_LLM_XPACK.md)
2. **Demo Guide:** [DEMO.md](DEMO.md)
3. **Full Documentation:** [README.md](README.md)
4. **Backend Details:** [backend-pathway/README.md](backend-pathway/README.md)

---

## 🎬 Ready to Present?

```bash
./start-demo.sh
```

Open http://localhost:3000 and wow your audience! 🚀

**Good luck!** 🎯

---

## 🎓 Hackathon Compliance: 100%

✅ Custom Python Connector (GPS)  
✅ Core Concepts (Streaming tables)  
✅ Streaming Transformations (Temporal windows)  
✅ **LLM xPack Integration (Real-time RAG)** ← NEW!  
✅ Learning Resources (Templates & tutorials)

**Ready for submission!** 🏆
