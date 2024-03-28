import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, SafeAreaView } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { buses } from "./data/bus";

export default function Home() {
  const [location, setLocation] = useState(null);
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
        calculateBusStops();
      } catch (error) {
        console.error("Error fetching location:", error.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Function to calculate bus stops
  const calculateBusStops = () => {
    let newBusStops = [];

    try {
      buses.forEach((bus) => {
        bus.places.forEach((place) => {
          place.coordinates.forEach((coordinate) => {
            newBusStops.push({
              latitude: parseFloat(coordinate.latitude),
              longitude: parseFloat(coordinate.longitude),
              name: place.name,
              waitingTime: place.waitingTime,
              color: place.color,
              station: coordinate.name,
            });
          });
        });
      });
      setBusStops(newBusStops);
    } catch (error) {
      console.error("Error calculating bus stops:", error.message);
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
                {busStops.map((busStop, index) => {
                  return (
                    <Marker
                      key={index}
                      coordinate={busStop}
                      // title={`Name:${busStop.name} Stop${index + 1}`}
                      title={`Name:${busStop.station} `}
                      description={`Waiting time:${busStop.waitingTime}`}
                    >
                      <MaterialCommunityIcons
                        name="bus"
                        size={24}
                        color={busStop.color}
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
