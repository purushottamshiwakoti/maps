import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, SafeAreaView } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { buses } from "./data/bus";
import axios from "axios";
import { apiUrl } from "./lib/url";

export default function Home() {
  const [location, setLocation] = useState(null);
  const [data, setData] = useState(null);
  const [busStops, setBusStops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      try {
        setLoading(true);
        const { coords } = await Location.getCurrentPositionAsync({});
        setLocation(coords);
      } catch (error) {
        console.error("Error fetching location:", error.message);
      } finally {
        setLoading(false);
      }
    })();
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      const res = await axios.get(`${apiUrl}/health-posts`);
      console.log("API Response:", res.data);
      const { hp } = res.data;
      setData(hp);
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          {loading ? (
            <Text>Loading...</Text>
          ) : (
            location && (
              <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                  title="Your Location"
                />
                {data &&
                  data.map((busStop, index) => {
                    console.log(parseFloat(busStop.latitude));
                    return (
                      <Marker
                        key={index}
                        coordinate={{
                          latitude: parseFloat(busStop.latitude),
                          longitude: parseFloat(busStop.longitude),
                        }}
                        title={`Name: ${busStop.name}`}
                        // description={`Waiting time: ${busStop.waitingTime}`}
                      >
                        <MaterialCommunityIcons
                          name="hospital"
                          size={24}
                          color={"red"}
                        />
                      </Marker>
                    );
                  })}
              </MapView>
            )
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
