import * as functions from 'firebase-functions/v2';
import { onNewFatalIssuePublished, onNewNonfatalIssuePublished, onRegressionAlertPublished, onVelocityAlertPublished } from 'firebase-functions/v2/alerts/crashlytics';
import { LinearClient } from '@linear/sdk';
import { initializeApp } from 'firebase-admin/app';
import { logger } from 'firebase-functions';

initializeApp();

interface LinearIssueData {
  title: string;
  description: string;
  teamId: string;
  priority: number;
  labelIds?: string[];
}

async function createLinearIssue(linearClient: LinearClient, issueData: LinearIssueData): Promise<string | null> {
  try {
    const issue = await linearClient.createIssue({
      title: issueData.title,
      description: issueData.description,
      teamId: issueData.teamId,
      priority: issueData.priority,
      labelIds: issueData.labelIds,
    });

    if (issue.success) {
      const createdIssue = await issue.issue;
      if (createdIssue) {
        logger.info(`Linear issue created successfully: ${createdIssue.id}`);
        
        await functions.eventarc.channel().publish({
          type: 'crashlytics-linear-sync.v1.issue-created',
          data: {
            issueId: createdIssue.id,
            issueUrl: createdIssue.url,
            timestamp: new Date().toISOString(),
          },
        });
        
        return createdIssue.id;
      }
    }
    
    throw new Error('Failed to create Linear issue');
  } catch (error) {
    logger.error('Error creating Linear issue:', error);
    
    await functions.eventarc.channel().publish({
      type: 'crashlytics-linear-sync.v1.issue-creation-failed',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
    });
    
    return null;
  }
}

function parseLabels(labelIds: string | undefined): string[] | undefined {
  if (!labelIds || labelIds.trim() === '') {
    return undefined;
  }
  return labelIds.split(',').map(id => id.trim()).filter(id => id.length > 0);
}

export const handleNewFatalIssue = onNewFatalIssuePublished(async (event) => {
  const createForFatal = process.env.CREATE_FOR_FATAL_ISSUES === 'true';
  if (!createForFatal) {
    logger.info('Skipping fatal issue creation based on configuration');
    return;
  }

  const linearApiKey = process.env.LINEAR_API_KEY;
  const linearTeamId = process.env.LINEAR_TEAM_ID;
  const priority = parseInt(process.env.LINEAR_ISSUE_PRIORITY || '2', 10);
  const labelIds = parseLabels(process.env.LINEAR_LABEL_IDS);

  if (!linearApiKey || !linearTeamId) {
    logger.error('Missing required configuration: LINEAR_API_KEY or LINEAR_TEAM_ID');
    return;
  }

  const linearClient = new LinearClient({ apiKey: linearApiKey });
  const issue = event.data.payload.issue;

  const issueData: LinearIssueData = {
    title: `[Crashlytics Fatal] ${issue.title}`,
    description: `## Fatal Crashlytics Issue Detected

**Issue ID:** ${issue.id}
**App:** ${event.appId}
**App Version:** ${issue.appVersion}

### Issue Details
- **Subtitle:** ${issue.subtitle}
- **First Occurrence:** ${new Date(parseInt(issue.createTime)).toISOString()}

### Impact
This is a fatal issue that causes the app to crash.

[View in Firebase Console](https://console.firebase.google.com/project/${event.appId}/crashlytics/app/${event.appId}/issues/${issue.id})`,
    teamId: linearTeamId,
    priority,
    labelIds,
  };

  await createLinearIssue(linearClient, issueData);
});

export const handleNewNonfatalIssue = onNewNonfatalIssuePublished(async (event) => {
  const createForNonFatal = process.env.CREATE_FOR_NON_FATAL_ISSUES === 'true';
  if (!createForNonFatal) {
    logger.info('Skipping non-fatal issue creation based on configuration');
    return;
  }

  const linearApiKey = process.env.LINEAR_API_KEY;
  const linearTeamId = process.env.LINEAR_TEAM_ID;
  const priority = parseInt(process.env.LINEAR_ISSUE_PRIORITY || '2', 10);
  const labelIds = parseLabels(process.env.LINEAR_LABEL_IDS);

  if (!linearApiKey || !linearTeamId) {
    logger.error('Missing required configuration: LINEAR_API_KEY or LINEAR_TEAM_ID');
    return;
  }

  const linearClient = new LinearClient({ apiKey: linearApiKey });
  const issue = event.data.payload.issue;

  const issueData: LinearIssueData = {
    title: `[Crashlytics Non-Fatal] ${issue.title}`,
    description: `## Non-Fatal Crashlytics Issue Detected

**Issue ID:** ${issue.id}
**App:** ${event.appId}
**App Version:** ${issue.appVersion}

### Issue Details
- **Subtitle:** ${issue.subtitle}
- **First Occurrence:** ${new Date(parseInt(issue.createTime)).toISOString()}

### Impact
This is a non-fatal issue that may affect user experience but doesn't crash the app.

[View in Firebase Console](https://console.firebase.google.com/project/${event.appId}/crashlytics/app/${event.appId}/issues/${issue.id})`,
    teamId: linearTeamId,
    priority,
    labelIds,
  };

  await createLinearIssue(linearClient, issueData);
});

export const handleRegressionAlert = onRegressionAlertPublished(async (event) => {
  const createForRegressions = process.env.CREATE_FOR_REGRESSIONS === 'true';
  if (!createForRegressions) {
    logger.info('Skipping regression alert creation based on configuration');
    return;
  }

  const linearApiKey = process.env.LINEAR_API_KEY;
  const linearTeamId = process.env.LINEAR_TEAM_ID;
  const priority = parseInt(process.env.LINEAR_ISSUE_PRIORITY || '2', 10);
  const labelIds = parseLabels(process.env.LINEAR_LABEL_IDS);

  if (!linearApiKey || !linearTeamId) {
    logger.error('Missing required configuration: LINEAR_API_KEY or LINEAR_TEAM_ID');
    return;
  }

  const linearClient = new LinearClient({ apiKey: linearApiKey });
  const issue = event.data.payload.issue;

  const issueData: LinearIssueData = {
    title: `[Crashlytics Regression] ${issue.title}`,
    description: `## Regression Alert - Previously Resolved Issue Has Returned

**Issue ID:** ${issue.id}
**App:** ${event.appId}
**App Version:** ${issue.appVersion}
**Alert Time:** ${event.data.payload.alertTime}

### Issue Details
- **Subtitle:** ${issue.subtitle}
- **First Occurrence:** ${new Date(parseInt(issue.createTime)).toISOString()}
- **Resolution Status:** ${issue.resolvedStatus}

### ⚠️ Regression Details
This issue was previously resolved but has now reoccurred. This may indicate:
- The fix was incomplete or ineffective
- A new code change has reintroduced the issue
- The issue has a different root cause than originally thought

[View in Firebase Console](https://console.firebase.google.com/project/${event.appId}/crashlytics/app/${event.appId}/issues/${issue.id})`,
    teamId: linearTeamId,
    priority: Math.min(priority - 1, 1), // Increase priority for regressions
    labelIds,
  };

  await createLinearIssue(linearClient, issueData);
});

export const handleVelocityAlert = onVelocityAlertPublished(async (event) => {
  const createForVelocity = process.env.CREATE_FOR_VELOCITY_ALERTS === 'true';
  if (!createForVelocity) {
    logger.info('Skipping velocity alert creation based on configuration');
    return;
  }

  const linearApiKey = process.env.LINEAR_API_KEY;
  const linearTeamId = process.env.LINEAR_TEAM_ID;
  const priority = parseInt(process.env.LINEAR_ISSUE_PRIORITY || '2', 10);
  const labelIds = parseLabels(process.env.LINEAR_LABEL_IDS);

  if (!linearApiKey || !linearTeamId) {
    logger.error('Missing required configuration: LINEAR_API_KEY or LINEAR_TEAM_ID');
    return;
  }

  const linearClient = new LinearClient({ apiKey: linearApiKey });
  const issue = event.data.payload.issue;
  const crashPercentage = event.data.payload.crashPercentage;

  const issueData: LinearIssueData = {
    title: `[Crashlytics Velocity Alert] ${issue.title} - ${crashPercentage}% crash rate`,
    description: `## 🚨 Velocity Alert - High Crash Rate Detected

**Issue ID:** ${issue.id}
**App:** ${event.appId}
**App Version:** ${issue.appVersion}
**Alert Time:** ${event.data.payload.alertTime}

### Critical Impact
**Crash Rate:** ${crashPercentage}% of sessions are crashing due to this issue

### Issue Details
- **Subtitle:** ${issue.subtitle}
- **First Occurrence:** ${new Date(parseInt(issue.createTime)).toISOString()}

### Why This Matters
This single issue is causing a significant percentage of your app sessions to crash. This requires immediate attention as it's severely impacting user experience and app stability.

[View in Firebase Console](https://console.firebase.google.com/project/${event.appId}/crashlytics/app/${event.appId}/issues/${issue.id})`,
    teamId: linearTeamId,
    priority: 1, // Always urgent for velocity alerts
    labelIds,
  };

  await createLinearIssue(linearClient, issueData);
});