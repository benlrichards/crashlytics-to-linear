# Crashlytics to Linear Issue Sync

A Firebase Extension that automatically creates Linear issues from Firebase Crashlytics alerts.

## Features

This extension monitors your Firebase Crashlytics alerts and automatically creates issues in Linear when:

- **New Fatal Issues** are detected (app crashes)
- **New Non-Fatal Issues** are detected (handled exceptions)
- **Regression Alerts** are triggered (previously fixed issues reoccur)
- **Velocity Alerts** are triggered (issues affecting a high percentage of sessions)

Each alert type can be individually enabled or disabled during configuration.

## Prerequisites

Before installing this extension, you need:

1. **Linear API Key**
   - Go to [Linear Settings > API](https://linear.app/settings/api)
   - Create a new Personal API Key
   - Copy the key for use during extension configuration

2. **Linear Team ID**
   - Navigate to your team in Linear
   - Go to Team Settings
   - Copy the Team ID

3. **Firebase Project with Crashlytics**
   - Crashlytics must be enabled and receiving crash data
   - Your app must be integrated with Firebase Crashlytics SDK

## Configuration

During installation, you'll need to provide:

### Required Parameters

- **Linear API Key**: Your Linear personal API key for authentication
- **Linear Team ID**: The ID of the Linear team where issues will be created

### Optional Parameters

- **Create issues for fatal crashes**: Enable/disable issue creation for fatal crashes (default: Yes)
- **Create issues for non-fatal issues**: Enable/disable issue creation for non-fatal issues (default: Yes)
- **Create issues for regressions**: Enable/disable issue creation for regression alerts (default: Yes)
- **Create issues for velocity alerts**: Enable/disable issue creation for velocity alerts (default: Yes)
- **Default Linear issue priority**: Set the default priority for created issues (default: High)
  - 1 = Urgent
  - 2 = High
  - 3 = Normal
  - 4 = Low
- **Linear Label IDs**: Comma-separated list of Linear label IDs to apply to all created issues (optional)

## How It Works

1. The extension deploys Cloud Functions that listen for Crashlytics alert events
2. When an alert is triggered, the function:
   - Extracts relevant crash information
   - Formats it into a detailed issue description
   - Creates a new issue in your specified Linear team
   - Includes a direct link back to the Firebase Console

## Issue Format

Created Linear issues include:

- **Title**: Alert type prefix + crash title (e.g., "[Crashlytics Fatal] NullPointerException")
- **Description**: 
  - Issue ID and app version
  - Crash details and subtitle
  - First occurrence timestamp
  - Impact assessment
  - Direct link to Firebase Console

## Events

The extension publishes the following events:

- `crashlytics-linear-sync.v1.issue-created`: When a Linear issue is successfully created
- `crashlytics-linear-sync.v1.issue-creation-failed`: When issue creation fails

## Billing

This extension uses the following Firebase services which may have associated costs:

- Cloud Functions (for processing alerts)
- Eventarc (for receiving and publishing events)

## Support

For issues, feature requests, or contributions, please visit the [GitHub repository](https://github.com/benlrichards/crashlytics-to-linear).

## License

Apache-2.0