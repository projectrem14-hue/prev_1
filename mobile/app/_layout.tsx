import { Stack } from 'expo-router';
import { SessionProvider } from '../src/lib/SessionContext';
import { DataProvider } from '../src/lib/DataContext';

export default function RootLayout() {
  return (
    <SessionProvider>
      <DataProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </DataProvider>
    </SessionProvider>
  );
}
