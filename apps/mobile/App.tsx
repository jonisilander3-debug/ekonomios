import { SafeAreaView } from 'react-native-safe-area-context';

import { MobileDashboard } from './src/features/dashboard/mobile-dashboard';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <MobileDashboard />
    </SafeAreaView>
  );
}
