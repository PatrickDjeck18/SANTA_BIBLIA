# Notes System Troubleshooting Guide

## Step 1: Run the Diagnostic Script

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/diagnose_notes.sql`
4. Run the script
5. Check the results

## Step 2: Set Up the Notes Table

If the diagnostic shows missing tables, run the setup script:

1. Copy the contents of `supabase/notes_simple_setup.sql`
2. Paste it in the Supabase SQL Editor
3. Run the script
4. Verify the tables were created

## Step 3: Check Authentication

Make sure the user is properly authenticated:

1. Check the console logs for user authentication
2. Look for: `👤 User ID: [some-uuid]`
3. If no user ID, the user needs to sign in

## Step 4: Common Issues and Solutions

### Issue: "relation 'notes' does not exist"
**Solution:** Run the `notes_simple_setup.sql` script

### Issue: "permission denied for table notes"
**Solution:** RLS policies are blocking access. Check:
- User is authenticated
- RLS policies are correctly set up
- User ID matches the policy conditions

### Issue: "new row violates check constraint"
**Solution:** Check the data being inserted:
- `title` and `content` cannot be empty
- `category` must be one of: 'reflection', 'prayer', 'study', 'journal', 'insight', 'gratitude', 'other'
- `mood_rating` must be between 1-10 if provided
- `background_color` must be a valid hex color

### Issue: "foreign key constraint fails"
**Solution:** The `user_id` must exist in the `profiles` table

## Step 5: Test the Setup

After running the setup, test by:

1. Opening the app
2. Going to the Notes page
3. Trying to create a new note
4. Check the console for detailed error messages

## Debug Information

The app now includes detailed logging. Look for these console messages:

- `📖 Fetching notes for user: [user-id]`
- `📝 Creating note with data: {...}`
- `✅ Note created successfully: {...}`
- `❌ Supabase error creating note: {...}`

## Quick Fix Commands

If you need to reset everything:

```sql
-- Drop and recreate notes table
DROP TABLE IF EXISTS notes CASCADE;
-- Then run the notes_simple_setup.sql script
```

## Still Having Issues?

1. Check the Supabase logs in the Dashboard
2. Look at the browser console for detailed error messages
3. Verify your Supabase connection settings
4. Make sure the user is properly signed in
