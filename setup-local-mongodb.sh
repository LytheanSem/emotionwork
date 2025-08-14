#!/bin/bash

echo "🚀 Setting up local MongoDB for development..."

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "❌ MongoDB is not installed."
    echo "📦 Installing MongoDB..."

    # For macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "🍎 Detected macOS, installing via Homebrew..."
        if ! command -v brew &> /dev/null; then
            echo "❌ Homebrew is not installed. Please install Homebrew first:"
            echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi

        brew tap mongodb/brew
        brew install mongodb-community
        echo "✅ MongoDB installed successfully!"
    else
        echo "❌ Unsupported OS. Please install MongoDB manually:"
        echo "   https://docs.mongodb.com/manual/installation/"
        exit 1
    fi
else
    echo "✅ MongoDB is already installed!"
fi

# Create data directory
echo "📁 Creating data directory..."
mkdir -p ~/data/db

# Start MongoDB service
echo "🚀 Starting MongoDB service..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    brew services start mongodb/brew/mongodb-community
    echo "✅ MongoDB service started!"
else
    sudo systemctl start mongod
    sudo systemctl enable mongod
    echo "✅ MongoDB service started and enabled!"
fi

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
sleep 5

# Test connection
if mongosh --eval "db.runCommand('ping')" &> /dev/null; then
    echo "✅ MongoDB is running and accessible!"
    echo ""
    echo "🎉 Setup complete! Now create a .env.local file with:"
    echo "   DATABASE_URI=mongodb://localhost:27017/emotionwork"
    echo "   PAYLOAD_SECRET=your-random-secret-key"
    echo ""
    echo "🔗 MongoDB is accessible at: mongodb://localhost:27017"
else
    echo "❌ MongoDB connection failed. Please check the service status."
    exit 1
fi
