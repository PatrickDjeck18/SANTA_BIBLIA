# Deploy Mood Scripture Edge Function

## Prerequisites
1. Supabase CLI installed
2. Logged into Supabase CLI
3. Project linked to your Supabase project

## Steps to Deploy

### 1. Navigate to your project directory
```bash
cd /path/to/your/project
```

### 2. Deploy the Edge Function
```bash
supabase functions deploy mood-scripture
```

### 3. Set the Environment Variable (DeepSeek API Key)
```bash
supabase secrets set DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

**Important:** Replace `your_deepseek_api_key_here` with your actual DeepSeek API key.

### 4. Verify Deployment
```bash
supabase functions list
```

You should see `mood-scripture` in the list.

## Testing the Function

### Test locally (optional)
```bash
supabase functions serve mood-scripture --env-file .env.local
```

### Test the deployed function
```bash
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/mood-scripture \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "moodType": "Happy",
    "intensity": 7,
    "category": "positive",
    "notes": "Feeling great today!"
  }'
```

## Function URL
Your function will be available at:
`https://YOUR_PROJECT_ID.supabase.co/functions/v1/mood-scripture`

## Troubleshooting

### Check function logs
```bash
supabase functions logs mood-scripture
```

### Check function status
```bash
supabase functions list
```

### Redeploy if needed
```bash
supabase functions deploy mood-scripture --no-verify-jwt
```

### Verify the secret is set
```bash
supabase secrets list
```

You should see `DEEPSEEK_API_KEY` in the list.

## Security Notes
- The function uses JWT verification by default
- API key is stored securely in Supabase secrets
- CORS is configured for web access
- Input validation is implemented

