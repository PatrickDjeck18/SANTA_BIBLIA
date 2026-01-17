# Firebase Index Setup for AI Bible Chat

## The Issue
The AI Bible chat feature requires a composite index in Firebase Firestore to query conversations by `userId` and order by `lastMessageTime`.

## Error Message
```
FirebaseError: The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/daily-bread-88f42/firestore/indexes
```

## Solution Options

### Option 1: Create Index via Firebase Console (Recommended)
1. Click the link provided in the error message
2. It will take you directly to the Firebase Console
3. Click "Create Index" to automatically create the required index
4. Wait for the index to be built (usually takes a few minutes)

### Option 2: Create Index via Firebase CLI
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init firestore`
4. Deploy indexes: `firebase deploy --only firestore:indexes`

### Option 3: Use the Fallback Query (Already Implemented)
The app now includes a fallback mechanism that:
- Fetches conversations without ordering from Firebase
- Sorts them in JavaScript by `lastMessageTime`
- This works but may be slower for large datasets

## Index Details
- **Collection**: `ai_conversations`
- **Fields**: 
  - `userId` (Ascending)
  - `lastMessageTime` (Descending)

## Verification
After creating the index, you should see:
- ✅ "Fetched conversations with composite index" in the console
- No more Firebase index errors
- Faster query performance

## Files Modified
- `hooks/useAIBibleChat.ts` - Added fallback query mechanism
- `firestore.indexes.json` - Index configuration file
