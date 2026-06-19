import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, radius } from '@/src/lib/theme';

interface Props {
  label?: string;
  value: Date | null;
  onChange: (d: Date) => void;
  minDate?: Date;
  testID?: string;
}

function pad(n: number) { return String(n).padStart(2, '0'); }
function toLocalInput(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function formatDisplay(d: Date) {
  return d.toLocaleString(undefined, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function DateTimePicker({ label, value, onChange, minDate, testID }: Props) {
  const [show, setShow] = useState<null | 'date' | 'time'>(null);
  const [tmp, setTmp] = useState<Date>(value || new Date(Date.now() + 60 * 60 * 1000));

  // Web: use native HTML datetime-local
  if (Platform.OS === 'web') {
    return (
      <View style={{ marginBottom: 12 }}>
        {label && <Text style={st.label}>{label}</Text>}
        <View style={st.webBox}>
          <Ionicons name="calendar" size={18} color={theme.brand} />
          {React.createElement('input' as any, {
            type: 'datetime-local',
            value: value ? toLocalInput(value) : '',
            min: minDate ? toLocalInput(minDate) : undefined,
            onChange: (e: any) => { if (e.target.value) onChange(new Date(e.target.value)); },
            style: { flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: theme.text, fontWeight: 600, fontFamily: 'inherit' },
            'data-testid': testID,
          })}
        </View>
        {value && <Text style={st.preview}>📅 {formatDisplay(value)}</Text>}
      </View>
    );
  }

  // Native: lazy import community picker
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const RNPicker = require('@react-native-community/datetimepicker').default;

  return (
    <View style={{ marginBottom: 12 }}>
      {label && <Text style={st.label}>{label}</Text>}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable testID={`${testID}-date`} onPress={() => setShow('date')} style={[st.pickBtn, { flex: 1 }]}>
          <Ionicons name="calendar" size={18} color={theme.brand} />
          <Text style={st.pickTxt}>{value ? value.toLocaleDateString() : 'Pick date'}</Text>
        </Pressable>
        <Pressable testID={`${testID}-time`} onPress={() => setShow('time')} style={[st.pickBtn, { flex: 1 }]}>
          <Ionicons name="time" size={18} color={theme.brand} />
          <Text style={st.pickTxt}>{value ? value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pick time'}</Text>
        </Pressable>
      </View>
      {value && <Text style={st.preview}>📅 {formatDisplay(value)}</Text>}
      {show && (
        <RNPicker
          value={value || tmp}
          mode={show}
          is24Hour
          minimumDate={minDate}
          onChange={(_: any, d?: Date) => {
            setShow(null);
            if (d) {
              const base = value || tmp;
              const merged = new Date(base);
              if (show === 'date') {
                merged.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
              } else {
                merged.setHours(d.getHours(), d.getMinutes(), 0, 0);
              }
              setTmp(merged);
              onChange(merged);
            }
          }}
        />
      )}
    </View>
  );
}

const st = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '800', color: theme.textMuted, marginBottom: 6 },
  webBox: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderColor: theme.border, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: theme.surface },
  preview: { fontSize: 12, color: theme.brand, marginTop: 6, fontWeight: '800' },
  pickBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: theme.border, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: theme.surface },
  pickTxt: { color: theme.text, fontWeight: '700', fontSize: 14 },
});
