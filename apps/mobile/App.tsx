import { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  StatusBar,
} from "react-native";

const SCENES = [
  "Full Cam",
  "Split Screen",
  "Reaction",
  "News Desk",
  "Shopping",
  "Gaming",
  "DJ Radio",
  "Movie Mode",
  "BRB",
];

const OBS_URL = process.env.EXPO_PUBLIC_OBS_CONTROLLER_URL || "http://localhost:3011";

async function callObs(path: string, body?: Record<string, unknown>) {
  try {
    await fetch(`${OBS_URL}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body || {}),
    });
  } catch {
    /* offline ok for local preview */
  }
}

export default function App() {
  const [onAir, setOnAir] = useState(true);
  const [scene, setScene] = useState("Split Screen");
  const [health, setHealth] = useState(92);
  const [toast, setToast] = useState("Ready");

  const healthColor = useMemo(() => {
    if (health >= 75) return "#2bff88";
    if (health >= 50) return "#ffcb1f";
    return "#ff2b3d";
  }, [health]);

  const switchScene = async (name: string) => {
    setScene(name);
    setToast(`Scene → ${name}`);
    await callObs("/scene", { sceneName: name });
  };

  const kill = async () => {
    setOnAir(false);
    setScene("BRB");
    setHealth((h) => Math.max(0, h - 20));
    setToast("KILL SWITCH — BRB");
    await callObs("/scene", { sceneName: "BRB" });
    await callObs("/stream/stop", {});
  };

  const goLive = async () => {
    setOnAir(true);
    setToast("ON AIR");
    await callObs("/stream/start", {});
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Text style={styles.logoT}>T</Text>
          </View>
          <View>
            <Text style={styles.title}>
              TIKCAST <Text style={{ color: "#ff2b3d" }}>LIVE</Text>
            </Text>
            <Text style={styles.sub}>MOBILE COMMAND</Text>
          </View>
        </View>

        <View style={[styles.badge, onAir ? styles.onAir : styles.offAir]}>
          <View style={[styles.dot, { backgroundColor: onAir ? "#ff2b3d" : "#64798c" }]} />
          <Text style={styles.badgeText}>{onAir ? "ON AIR" : "OFF AIR"}</Text>
          <Text style={styles.sceneChip}>{scene}</Text>
        </View>

        <View style={styles.healthCard}>
          <Text style={styles.healthLabel}>HEALTH SCORE</Text>
          <Text style={[styles.healthScore, { color: healthColor }]}>{health}</Text>
          <Text style={{ color: healthColor, fontWeight: "700" }}>
            {health >= 75 ? "SAFE" : health >= 50 ? "WATCH" : "AT RISK"}
          </Text>
        </View>

        <Text style={styles.section}>SCENES</Text>
        <View style={styles.grid}>
          {SCENES.map((s) => {
            const active = s === scene;
            return (
              <Pressable
                key={s}
                onPress={() => switchScene(s)}
                style={[styles.sceneBtn, active && styles.sceneActive]}
              >
                <Text style={[styles.sceneText, active && { color: "#000" }]}>{s}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.kill} onPress={kill}>
            <Text style={styles.killText}>KILL SWITCH</Text>
          </Pressable>
          <Pressable style={styles.live} onPress={goLive}>
            <Text style={styles.liveText}>{onAir ? "RESTART" : "GO LIVE"}</Text>
          </Pressable>
        </View>

        <Text style={styles.toast}>{toast}</Text>
        <Text style={styles.hint}>
          Points at OBS controller {OBS_URL}. Use same Wi‑Fi as your studio PC.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#06080b" },
  content: { padding: 20, paddingBottom: 48 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#ff2b3d",
    alignItems: "center",
    justifyContent: "center",
  },
  logoT: { color: "#fff", fontWeight: "900", fontSize: 20 },
  title: { color: "#eaf4fa", fontWeight: "800", fontSize: 22 },
  sub: { color: "#8da3b3", letterSpacing: 2, fontSize: 10, marginTop: 4 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  onAir: { backgroundColor: "#2a0a0e", borderColor: "rgba(255,45,85,0.5)" },
  offAir: { backgroundColor: "#121a22", borderColor: "#22303e" },
  dot: { width: 10, height: 10, borderRadius: 5 },
  badgeText: { color: "#fff", fontWeight: "800", letterSpacing: 1 },
  sceneChip: { marginLeft: "auto", color: "#8da3b3", fontSize: 12 },
  healthCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#22303e",
    backgroundColor: "#0c1116",
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  healthLabel: { color: "#8da3b3", letterSpacing: 2, fontSize: 11 },
  healthScore: { fontSize: 56, fontWeight: "900", marginVertical: 4 },
  section: {
    color: "#8da3b3",
    letterSpacing: 2,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 10,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sceneBtn: {
    width: "31%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#22303e",
    backgroundColor: "#121a22",
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  sceneActive: { backgroundColor: "#00e5ff", borderColor: "#00e5ff" },
  sceneText: { color: "#eaf4fa", fontWeight: "700", fontSize: 12, textAlign: "center" },
  actions: { flexDirection: "row", gap: 10, marginTop: 24 },
  kill: {
    flex: 1,
    backgroundColor: "#ff2b3d",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  killText: { color: "#fff", fontWeight: "900" },
  live: {
    flex: 1,
    backgroundColor: "#00e5ff",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  liveText: { color: "#000", fontWeight: "900" },
  toast: { marginTop: 18, color: "#2bff88", fontWeight: "700" },
  hint: { marginTop: 8, color: "#64798c", fontSize: 12, lineHeight: 18 },
});
