import { getDatabase } from '../database/connection.js';

export async function saveDecision({ userId, challengeId, contentHash, status, mode, points, metadata }) {
  try {
    const db = await getDatabase();
    
    // Save to challenge_runs (runs table)
    const runsCollection = db.collection('challenge_runs');
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    await runsCollection.updateOne(
      { 
        userId, 
        challengeSlug: challengeId, 
        day: today 
      },
      { 
        $set: {
          userId,
          challengeSlug: challengeId,
          day: today,
          status: mapStatusForDB(status),
          points: points || 0,
          topic: metadata?.topic || 'general',
          difficulty: metadata?.difficulty || 'easy',
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: metadata || {}
        }
      },
      { upsert: true }
    );

    // If successful, also update user profile
    if (status === 'success') {
      await updateUserProfile(userId, points || 10, metadata?.topic);
    }

    console.log(`Decision saved to DB: user ${userId}, challenge ${challengeId}, status ${status}`);
    
    return { success: true, userId, challengeId, status };
    
  } catch (error) {
    console.error('Error saving decision to DB:', error);
    // Don't throw error - let system continue working
    return { success: false, error: error.message };
  }
}

export async function getUserHistory(userId, limit = 50) {
  try {
    const db = await getDatabase();
    const collection = db.collection('challenge_runs');
    
    const history = await collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
      
    console.log(`Retrieved ${history.length} history items for user ${userId}`);
    return history;
    
  } catch (error) {
    console.error('Error fetching user history:', error);
    return [];
  }
}

export async function getCompletedChallenges(userId, topic = null) {
  try {
    const db = await getDatabase();
    const collection = db.collection('challenge_runs');
    
    const query = { 
      userId, 
      status: 'completed'
    };
    
    if (topic) {
      query.topic = topic;
    }
    
    const completedRuns = await collection
      .find(query)
      .toArray();
    
    const challengeIds = completedRuns.map(run => run.challengeSlug);
    
    console.log(`Found ${challengeIds.length} completed challenges for user ${userId}${topic ? ` in topic ${topic}` : ''}`);
    return challengeIds;
    
  } catch (error) {
    console.error('Error fetching completed challenges:', error);
    return [];
  }
}

export async function getUserStats(userId) {
  try {
    const db = await getDatabase();
    const collection = db.collection('challenge_runs');
    
    const stats = await collection.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalPoints: { $sum: '$points' }
        }
      }
    ]).toArray();
    
    // Statistics by topic
    const topicStats = await collection.aggregate([
      { $match: { userId, status: 'completed' } },
      {
        $group: {
          _id: '$topic',
          count: { $sum: 1 },
          totalPoints: { $sum: '$points' }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log(`Retrieved stats for user ${userId}`);
    return {
      byStatus: stats,
      byTopic: topicStats,
      totalCompleted: topicStats.reduce((sum, topic) => sum + topic.count, 0),
      totalPoints: topicStats.reduce((sum, topic) => sum + topic.totalPoints, 0)
    };
    
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return { byStatus: [], byTopic: [], totalCompleted: 0, totalPoints: 0 };
  }
}

export async function saveSurveyData(userId, surveyData) {
  try {
    const db = await getDatabase();
    const collection = db.collection('user_profiles');
    
    const profileDoc = {
      userId,
      selectedTopics: surveyData.selectedTopics || [],
      answers: surveyData.answers || {},
      scores: surveyData.scores || {},
      normalized: surveyData.normalized || {},
      primaryMotivation: surveyData.primaryMotivation || 'intrinsic',
      totalPoints: 0,
      currentLevel: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await collection.updateOne(
      { userId },
      { 
        $set: profileDoc,
        $setOnInsert: { 
          createdAt: new Date(),
          totalPoints: 0,
          currentLevel: 1 
        }
      },
      { upsert: true }
    );
    
    console.log(`Survey data saved for user ${userId}`);
    return { success: true };
    
  } catch (error) {
    console.error('Error saving survey data:', error);
    return { success: false, error: error.message };
  }
}

async function updateUserProfile(userId, points, topic) {
  try {
    const db = await getDatabase();
    const collection = db.collection('user_profiles');
    
    // Calculate new level (every 100 points = level)
    const result = await collection.findOneAndUpdate(
      { userId },
      { 
        $inc: { totalPoints: points },
        $set: { 
          lastActivity: new Date(),
          updatedAt: new Date()
        },
        $push: { 
          recentActivity: { 
            $each: [{ points, topic, timestamp: new Date() }],
            $slice: -10 // שמור רק 10 פעילויות אחרונות
          }
        }
      },
      { 
        upsert: true, 
        returnDocument: 'after',
        projection: { totalPoints: 1 }
      }
    );
    
    // Update level
    if (result.value) {
      const newLevel = Math.floor(result.value.totalPoints / 100) + 1;
      
      await collection.updateOne(
        { userId },
        { $set: { currentLevel: newLevel } }
      );
      
      console.log(`User ${userId} updated: +${points} points, level ${newLevel}`);
    }
    
  } catch (error) {
    console.error('Error updating user profile:', error);
  }
}

function mapStatusForDB(frontendStatus) {
  const statusMap = {
    'success': 'completed',
    'later': 'postponed', 
    'skip': 'skipped'
  };
  
  return statusMap[frontendStatus] || frontendStatus;
}

export async function getUserProfile(userId) {
  try {
    const db = await getDatabase();
    const collection = db.collection('user_profiles');
    
    const profile = await collection.findOne({ userId });
    
    if (!profile) {
      console.log(`No profile found for user ${userId}`);
      return null;
    }
    
    console.log(`Retrieved profile for user ${userId}, level ${profile.currentLevel}`);
    return profile;
    
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}