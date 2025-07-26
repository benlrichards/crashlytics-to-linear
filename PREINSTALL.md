# Before You Install

This extension will automatically create Linear issues whenever Firebase Crashlytics detects problems in your app.

## What You'll Need

### 1. Linear API Key
- Sign in to [Linear](https://linear.app)
- Go to Settings → API → Personal API Keys
- Click "Create key"
- Give it a descriptive name like "Firebase Crashlytics Integration"
- Copy the generated key (you'll need it during setup)

### 2. Linear Team ID
- In Linear, navigate to your team
- Go to Team Settings
- Find and copy the Team ID

### 3. Active Crashlytics Integration
- Your Firebase project must have Crashlytics enabled
- Your app must be sending crash data to Crashlytics

## What This Extension Does

When installed, this extension will:

1. Monitor your Crashlytics alerts in real-time
2. Create Linear issues for different types of alerts:
   - **Fatal crashes** that cause your app to crash
   - **Non-fatal issues** that are handled but still problematic
   - **Regressions** when previously fixed issues return
   - **Velocity alerts** when an issue affects many users

3. Each Linear issue will include:
   - Crash details and stack trace information
   - App version and issue ID
   - Direct link to view full details in Firebase Console
   - Appropriate priority based on severity

## Customization Options

During setup, you can:
- Choose which types of alerts create Linear issues
- Set default priority levels
- Add specific labels to all created issues
- Configure team assignment

## Billing

This extension uses Cloud Functions which may incur charges based on:
- Number of function invocations (one per Crashlytics alert)
- Function execution time (typically minimal)

Most projects will stay within the free tier limits unless experiencing very high crash volumes.

## Privacy & Security

- Your Linear API key is stored securely in Firebase
- No crash data is stored by the extension
- All data transfer happens directly between Firebase and Linear
- The extension only has access to Crashlytics alert data, not raw crash dumps