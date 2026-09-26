import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View, StyleSheet } from 'react-native';
import { FEATURES } from './config/features';
import HomeScreen from './screens/HomeScreen';
import UnitSelectScreen from './screens/UnitSelectScreen';
import GameScreen from './screens/GameScreen';
import ResultScreen from './screens/ResultScreen';
import StatsScreen from './screens/StatsScreen';
import AvatarScreen from './screens/AvatarScreen';
import NotesScreen from './screens/NotesScreen';
import OfficeScreen from './screens/OfficeScreen';
import PuzzleScreen from './screens/PuzzleScreen';
import ChallengeScreen from './screens/ChallengeScreen';
import ChallengeResultScreen from './screens/ChallengeResultScreen';
import CalendarScreen from './screens/CalendarScreen';
import AppointmentsScreen from './screens/AppointmentsScreen';
import LibraryScreen from './screens/LibraryScreen';
import BookDetailScreen from './screens/BookDetailScreen';
import ReaderScreen from './screens/ReaderScreen';
import SurveysScreen from './screens/SurveysScreen';
import CalculatorScreen from './screens/CalculatorScreen';
import MailScreen from './screens/MailScreen';
import MessagesScreen from './screens/MessagesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function ComingSoon({ route }) {
  return (
    <View style={styles.soon}>
      <Text style={styles.soonEmoji}>🚧</Text>
      <Text style={styles.soonText}>{route.name} yakında geliyor!</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1a1a6e', borderTopColor: 'rgba(255,255,255,0.1)' },
        tabBarActiveTintColor: '#a855f7',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Ana Menü', tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text> }} />
      {FEATURES.office && (
        <Tab.Screen name="Office" component={OfficeScreen} options={{ tabBarLabel: 'Ofisim', tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏢</Text> }} />
      )}
      <Tab.Screen name="Stats" component={StatsScreen} options={{ tabBarLabel: 'Başarılarım', tabBarIcon: () => <Text style={{ fontSize: 20 }}>📊</Text> }} />
      <Tab.Screen name="Notes" component={NotesScreen} options={{ tabBarLabel: 'Notlarım', tabBarIcon: () => <Text style={{ fontSize: 20 }}>📝</Text> }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#1a1a6e' },
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="UnitSelect" component={UnitSelectScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="Avatar" component={AvatarScreen} />
        <Stack.Screen name="Library" component={LibraryScreen} />
        <Stack.Screen name="BookDetail" component={BookDetailScreen} />
        <Stack.Screen name="Reader" component={ReaderScreen} />
        <Stack.Screen name="Puzzle" component={PuzzleScreen} />
        {FEATURES.challenge && (
          <>
            <Stack.Screen name="Challenge" component={ChallengeScreen} />
            <Stack.Screen name="ChallengeResult" component={ChallengeResultScreen} />
          </>
        )}
        {FEATURES.office && (
          <>
            <Stack.Screen name="Calendar" component={CalendarScreen} />
            <Stack.Screen name="Appointments" component={AppointmentsScreen} />
          </>
        )}
        {FEATURES.surveys && <Stack.Screen name="Surveys" component={SurveysScreen} />}
        {FEATURES.mail && <Stack.Screen name="Mail" component={MailScreen} />}
        {FEATURES.messages && <Stack.Screen name="Messages" component={MessagesScreen} />}
        {FEATURES.calculator && <Stack.Screen name="Calculator" component={CalculatorScreen} />}
      </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  soon: { flex: 1, backgroundColor: '#1a1a6e', alignItems: 'center', justifyContent: 'center' },
  soonEmoji: { fontSize: 60, marginBottom: 16 },
  soonText: { fontSize: 20, color: '#fff', fontWeight: 'bold' },
});