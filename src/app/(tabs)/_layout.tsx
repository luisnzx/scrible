import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius } from '@/constants/theme';

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemFocused]}>
      <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{icon}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="💕" label="Inicio" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="canvas"
        options={{
          title: 'Dibujar',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="✏️" label="Dibujar" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="💬" label="Chat" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👤" label="Perfil" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
    height: 70,
    paddingBottom: 8,
    paddingTop: 8,
    elevation: 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
  },
  tabItemFocused: {
    backgroundColor: 'rgba(255, 107, 157, 0.12)',
  },
  tabIcon: {
    fontSize: 20,
  },
  tabIconFocused: {
    fontSize: 22,
  },
  tabLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  tabLabelFocused: {
    color: Colors.primary,
  },
});
