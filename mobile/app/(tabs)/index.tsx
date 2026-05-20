import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSession } from '../src/lib/SessionContext';
import { useData } from '../src/lib/DataContext';
import { useEffect } from 'react';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 600;

export default function DashboardScreen() {
  const { user } = useSession();
  const { intentions, logs, loading } = useData();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login');
    }
  }, [user]);

  const completedCount = logs.filter(l => l.completed).length;
  const missedCount = logs.filter(l => !l.completed).length;
  const completionRate = intentions.length > 0 
    ? Math.round((completedCount / intentions.length) * 100)
    : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>GapLogic</Text>
        <Text style={styles.subtitle}>Behavioral Dashboard</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, isSmallScreen && styles.statCardSmall]}>
          <Text style={styles.statValue}>{completionRate}%</Text>
          <Text style={styles.statLabel}>Completion Rate</Text>
        </View>
        <View style={[styles.statCard, isSmallScreen && styles.statCardSmall]}>
          <Text style={styles.statValue}>{completedCount}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={[styles.statCard, isSmallScreen && styles.statCardSmall]}>
          <Text style={styles.statValue}>{missedCount}</Text>
          <Text style={styles.statLabel}>Missed</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/modeler')}
        >
          <Text style={styles.actionButtonText}>+ Add Intention</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => router.push('/focus')}
        >
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Start Focus</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activities */}
      <View style={styles.activitiesSection}>
        <Text style={styles.sectionTitle}>Recent Activities</Text>
        {intentions.slice(0, 5).map((intention) => {
          const log = logs.find(l => l.intentionId === intention.id);
          return (
            <View key={intention.id} style={styles.activityCard}>
              <View style={styles.activityLeft}>
                <View style={[
                  styles.activityIcon,
                  { backgroundColor: log?.completed ? '#10b98120' : '#ef444420' }
                ]}>
                  <Text style={[
                    styles.activityIconText,
                    { color: log?.completed ? '#10b981' : '#ef4444' }
                  ]}>
                    {log?.completed ? '✓' : '✕'}
                  </Text>
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>{intention.title}</Text>
                  <Text style={styles.activityMeta}>{intention.category}</Text>
                </View>
              </View>
              <Text style={[
                styles.activityStatus,
                { color: log?.completed ? '#10b981' : '#ef4444' }
              ]}>
                {log?.completed ? 'Done' : 'Missed'}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    padding: isSmallScreen ? 12 : 16,
  },
  header: {
    marginBottom: 24,
    marginTop: 12,
  },
  title: {
    fontSize: isSmallScreen ? 28 : 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: isSmallScreen ? 14 : 16,
    color: '#888888',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: isSmallScreen ? 'space-between' : 'space-around',
    marginBottom: 24,
    gap: isSmallScreen ? 8 : 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: isSmallScreen ? 12 : 16,
    alignItems: 'center',
  },
  statCardSmall: {
    paddingVertical: 12,
  },
  statValue: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: isSmallScreen ? 11 : 12,
    color: '#888888',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: isSmallScreen ? 'column' : 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: isSmallScreen ? 12 : 14,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#1a1a1a',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: isSmallScreen ? 14 : 16,
  },
  secondaryButtonText: {
    color: '#3b82f6',
  },
  activitiesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  activityCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  activityMeta: {
    color: '#888888',
    fontSize: 12,
    marginTop: 2,
  },
  activityStatus: {
    fontWeight: 'bold',
    fontSize: 12,
  },
});
