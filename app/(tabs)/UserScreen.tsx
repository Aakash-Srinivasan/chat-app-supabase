import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { fetchUsers } from "../../fetchUsers";
import { createOrGetRoom } from "@/getOrCreateRoom";
import { useRouter } from "expo-router";

const UserScreen = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const onUserPress = async (selectedUserId: string) => {
    try {
      const room = await createOrGetRoom(selectedUserId);
      router.push({
        pathname: "/(tabs)/ChatScreen",
        params: { roomId: room.room_id },
      });
    } catch (error) {
      console.error("Room creation error:", error);
      Alert.alert("Error", "Could not create room.");
    }
  };

  useEffect(() => {
    const loadUsers = async () => {
      const userList = await fetchUsers();
      setUsers(userList);
      setLoading(false);
    };

    loadUsers();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#000" />;

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onUserPress(item.id)}>
            <View
              style={{
                padding: 10,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {item.avatar_url && (
                <Image
                  source={{ uri: item.avatar_url }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    marginRight: 10,
                  }}
                />
              )}
              <Text>{item.full_name || item.email}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default UserScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
});
