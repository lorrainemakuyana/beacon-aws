#!/bin/bash

# Beacon Platform Setup Script
# This script helps you set up the Beacon platform for development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}"
    echo "🚀 Beacon Platform Setup"
    echo "========================"
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    print_success "Node.js $(node -v) is installed"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_success "npm $(npm -v) is installed"
    
    # Check Java (for Firestore emulator)
    if ! command -v java &> /dev/null; then
        print_warning "Java is not installed. Firestore emulator requires Java 11+"
        print_info "You can install Java from https://adoptium.net/"
    else
        print_success "Java is installed"
    fi
}

install_firebase_cli() {
    print_info "Checking Firebase CLI..."
    
    if ! command -v firebase &> /dev/null; then
        print_info "Installing Firebase CLI globally..."
        npm install -g firebase-tools
        print_success "Firebase CLI installed"
    else
        print_success "Firebase CLI is already installed"
    fi
}

install_dependencies() {
    print_info "Installing project dependencies..."
    npm install
    print_success "Dependencies installed"
}

firebase_setup() {
    print_info "Firebase setup instructions:"
    echo ""
    echo "1. Go to https://console.firebase.google.com"
    echo "2. Create a new project or use existing: 'beacon-3b6d6'"
    echo "3. Enable these services:"
    echo "   - Authentication (Email/Password)"
    echo "   - Firestore Database"
    echo "   - Storage"
    echo "4. Update mobile/firebase/config.ts with your Firebase configuration"
    echo ""
    
    read -p "Have you completed the Firebase setup? (y/N): " firebase_done
    if [[ $firebase_done =~ ^[Yy]$ ]]; then
        print_success "Firebase setup completed"
    else
        print_warning "Please complete Firebase setup before running the application"
    fi
}

show_next_steps() {
    print_info "Setup complete! Next steps:"
    echo ""
    echo "🔥 Start Firebase emulators:"
    echo "   npm run firebase:emulators"
    echo ""
    echo "🌐 Start web dashboard (in another terminal):"
    echo "   npm run dev:web"
    echo ""
    echo "📱 Start mobile development (in another terminal):"
    echo "   npm run dev:mobile"
    echo ""
    echo "🎯 Access points:"
    echo "   - Firebase Emulator UI: http://localhost:4000"
    echo "   - Web Dashboard: http://localhost:3000"
    echo "   - Mobile: Use Expo Go app with QR code"
    echo ""
    echo "🚀 When ready to deploy:"
    echo "   - Backend: npm run firebase:deploy"
    echo "   - Web App: See HOSTING.md for platform options"
    echo "   - Mobile: cd mobile && npx expo publish"
    echo ""
    print_success "Happy coding! 🚀"
}

# Main setup flow
main() {
    print_header
    
    check_prerequisites
    install_firebase_cli
    install_dependencies
    firebase_setup
    show_next_steps
}

# Run main function
main