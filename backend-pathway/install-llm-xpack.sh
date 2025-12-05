#!/bin/bash

echo "═══════════════════════════════════════════════════════════════"
echo "🚀 Installing Pathway LLM xPack Dependencies"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Activate virtual environment
if [ ! -d "venv-pathway" ]; then
    echo "❌ Virtual environment not found!"
    echo "Run: python3 -m venv venv-pathway"
    exit 1
fi

source venv-pathway/bin/activate

echo "📦 Upgrading pip..."
pip install --upgrade pip

echo ""
echo "📦 Installing Pathway with latest version..."
pip install --upgrade pathway

echo ""
echo "📦 Installing LLM dependencies..."
pip install --upgrade openai litellm tiktoken

echo ""
echo "📦 Installing other dependencies..."
pip install -r requirements-pathway.txt

echo ""
echo "✅ Installation complete!"
echo ""

# Test installation
echo "🧪 Testing Pathway installation..."
python -c "import pathway as pw; print(f'✅ Pathway version: {pw.__version__}')"

echo ""
echo "🧪 Testing OpenAI installation..."
python -c "import openai; print(f'✅ OpenAI version: {openai.__version__}')"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "🎉 Ready to use Pathway LLM xPack!"
echo "═══════════════════════════════════════════════════════════════"
