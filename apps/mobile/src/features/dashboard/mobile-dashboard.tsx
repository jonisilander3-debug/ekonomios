import { createDashboardSummary } from '@ekonomi/business';
import { Text, View } from 'react-native';

const metrics = {
  bookedPaymentsToday: 4,
  activeClockedInEmployees: 3,
  pendingReceipts: 2
};

export function MobileDashboard() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#f7f5f1',
        paddingHorizontal: 20,
        paddingTop: 72,
        gap: 18
      }}
    >
      <View
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 28,
          padding: 22
        }}
      >
        <Text style={{ color: '#78716c', fontSize: 14, marginBottom: 8 }}>
          Mobil översikt
        </Text>
        <Text style={{ color: '#1c1917', fontSize: 28, fontWeight: '600', marginBottom: 10 }}>
          Hej Anders
        </Text>
        <Text style={{ color: '#57534e', fontSize: 15, lineHeight: 24 }}>
          {createDashboardSummary('Anders', metrics)}
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        {[
          'Ladda upp kvitto',
          'Registrera tid',
          'Öppna projekt',
          'Se lönestatus'
        ].map((item) => (
          <View
            key={item}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 24,
              paddingHorizontal: 20,
              paddingVertical: 18
            }}
          >
            <Text style={{ color: '#1c1917', fontSize: 16, fontWeight: '500' }}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
