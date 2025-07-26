# Installation Complete! 🎉

Your Crashlytics to Linear sync extension is now active and monitoring for alerts.

## What Happens Next?

The extension is now listening for Crashlytics alerts. When alerts are triggered, Linear issues will be created automatically based on your configuration.

## Testing Your Setup

To verify the extension is working:

1. **Trigger a Test Crash** (for development apps only):
   ```swift
   // iOS Swift example
   fatalError("Test crash for Linear integration")
   ```
   
   ```kotlin
   // Android Kotlin example
   throw RuntimeException("Test crash for Linear integration")
   ```

2. **Check Linear**:
   - New issues should appear in your specified team
   - Issues will have titles like "[Crashlytics Fatal] Test crash..."

## Monitoring

You can monitor the extension's activity:

1. **Firebase Console**:
   - Go to Extensions → Crashlytics to Linear Sync
   - Check the logs for function executions

2. **Linear**:
   - Created issues will appear in your team's triage or backlog
   - Look for the Crashlytics prefix in issue titles

## Customizing Issue Creation

If you need to adjust which alerts create issues:

1. Go to Firebase Console → Extensions
2. Click on "Crashlytics to Linear Sync"
3. Click "Reconfigure extension"
4. Update your preferences

## Troubleshooting

### No Issues Being Created?

1. **Verify Crashlytics is receiving data**:
   - Check Firebase Console → Crashlytics
   - Ensure crash reports are being received

2. **Check extension logs**:
   - Firebase Console → Extensions → View logs
   - Look for any error messages

3. **Verify Linear configuration**:
   - Ensure your API key is valid
   - Confirm the Team ID is correct
   - Check that the Linear API key has write permissions

### Issues Created But Missing Information?

- The extension only has access to alert data, not full crash dumps
- For detailed stack traces, users should follow the Firebase Console link in the Linear issue

## Managing Alerts

To prevent alert fatigue:

1. **Adjust Crashlytics alert thresholds** in Firebase Console
2. **Use Linear labels** to categorize and filter Crashlytics issues
3. **Configure extension** to only create issues for critical alert types

## Need Help?

- **Extension Issues**: [GitHub Repository](https://github.com/benlrichards/crashlytics-to-linear)
- **Crashlytics Help**: [Firebase Crashlytics Docs](https://firebase.google.com/docs/crashlytics)
- **Linear API**: [Linear API Docs](https://developers.linear.app/docs)