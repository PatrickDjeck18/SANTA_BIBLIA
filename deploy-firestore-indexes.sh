#!/bin/bash

# Deploy Firestore indexes to Firebase
# This script will create the required composite indexes for the gratitude entries

echo "🚀 Deploying Firestore indexes..."

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Please login to Firebase first:"
    echo "firebase login"
    exit 1
fi

# Deploy the indexes
echo "📊 Deploying indexes..."
firebase deploy --only firestore:indexes

echo "✅ Firestore indexes deployed successfully!"
echo ""
echo "The following indexes have been created:"
echo "1. gratitude_entries: user_id (ASC) + created_at (DESC)"
echo "2. gratitude_entries: user_id (ASC) + is_guest (ASC) + created_at (DESC)"
echo ""
echo "Your gratitude journal should now work without index errors! 🎉"
