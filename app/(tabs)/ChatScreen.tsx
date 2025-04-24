// // ChatScreen.tsx
// import React, { useState, useEffect } from 'react';
// import { View, Text, FlatList, TextInput, Button, StyleSheet } from 'react-native';
// import { supabase } from '../../supabaseClient'; // Supabase client initialization
// import { useLocalSearchParams, useRouter } from 'expo-router';

// const ChatScreen = () => {
//     const {roomId } = useLocalSearchParams<{ roomId: string }>();
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();
// //   console.log("Room ID:", roomId);
//   // Fetch messages for the room
// useEffect(() => {
//     const intervalId = setInterval(() => {
//       fetchMessages();
//     }, 3000); // Call fetchMessages every 3 seconds

//     return () => clearInterval(intervalId); // Cleanup interval on component unmount
//   }, [roomId]);

//   const fetchMessages = async () => {
//     if (!roomId) {
//       console.log("Room ID is not yet available, skipping fetch.");
//       return;
//     }

//     const { data, error } = await supabase
//       .from("messages")
//       .select("*")
//       .eq("room_id", roomId as any) // cast roomid to any, or explicitly as UUID
//       .order("created_at", { ascending: true }); // oldest to newest
//    console.log("Fetched messages:", data);
//     if (error) {
//       console.error("Error fetching messages:", error);
//     } else {
//       setMessages(data as any);
//     }
//   };

//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     const {
//       data: { user },
//       error: userError,
//     } = await supabase.auth.getUser();

//     if (userError || !user) {
//       console.error('Error getting user:', userError);
//       return;
//     }

//     const { error } = await supabase.from('messages').insert({
//       room_id: roomId, // Convert roomId to an integer
//       content: input,
//       sender_id: user.id,
//       sender_email: user.email,
//     });

//     if (error) {
//       console.error('Error sending message:', error);
//     } else {
//       setInput('');
//       await fetchMessages(); // re-fetch messages
//     }
//   };

//   // Render messages
//   interface Message {
//     id: string;
//     sender_email: string;
//     content: string;
//   }

//   const renderMessage = ({ item }: { item: Message }) => (
//     <View style={styles.message}>
//       <Text style={styles.sender}>{item.sender_email}: </Text>
//       <Text>{item.content}</Text>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={messages}
//         renderItem={renderMessage}
//         keyExtractor={(item) => item.id}
//         inverted
//         style={styles.messageList}
//         refreshing={loading}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Type a message..."
//         value={input}
//         onChangeText={setInput}
//       />
//       <Button title="Send" onPress={sendMessage} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 10,
//   },
//   messageList: {
//     flex: 1,
//     marginBottom: 10,
//   },
//   message: {
//     padding: 10,
//     borderBottomWidth: 1,
//     borderColor: '#ddd',
//   },
//   sender: {
//     fontWeight: 'bold',
//   },
//   input: {
//     padding: 10,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     marginBottom: 10,
//   },
// });

// export default ChatScreen;
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  StyleSheet,
} from "react-native";
import { supabase } from "../../supabaseClient"; // Supabase client initialization
import { useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";

const ChatScreen = () => {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null); // Ref for FlatList
  const [fullName, setFullName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
    const intervalId = setInterval(() => {
      fetchMessages();
    }, 3000); // Call fetchMessages every 3 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [roomId]);

  useEffect(() => {
    const channel = supabase
      .channel('room-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      )
      .subscribe();
  
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  useEffect(() => {
    // Fetch current user email
    const fetchCurrentUser = async () => {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
      
        if (error || !user) {
          console.error("Error fetching current user:", error);
          return;
        }
      
        // Fetch user details (full_name, avatar_url) from the 'users' table
        const { data: userData, error: userDataError } = await supabase
          .from("users")
          .select("full_name, avatar_url")
          .eq("email", user.email) // Assuming email is unique in the users table
          .single(); // Assuming you only expect one result based on email
      
        if (userDataError) {
          console.error("Error fetching user data:", userDataError);
        } else {
          // If everything is okay, update the state
          setCurrentUserEmail(user.email || null);
        //   console.log("User Data:", userData);
          // You can store full_name and avatar_url if needed
          setFullName(userData?.full_name || null);
          setAvatarUrl(userData?.avatar_url || null);
        }
      };
      

    fetchCurrentUser();
  }, []);

 
  

  const fetchMessages = async () => {
    if (!roomId) {
      console.log("Room ID is not yet available, skipping fetch.");
      return;
    }

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true }); // Oldest to newest

    if (error) {
      console.error("Error fetching messages:", error);
    } else {
      setMessages(data || []);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return; // Do nothing if input is empty
  
    // Fetch the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Error getting user:", userError);
      return;
    }
  
    // Ensure fullName and avatarUrl are available
    if (!fullName || !avatarUrl) {
      console.error("Full name or avatar URL is missing!");
      return;
    }
  
    // Insert the message into the database
    const { error } = await supabase.from("messages").insert({
      room_id: roomId,
      content: input,
      sender_id: user.id,
      sender_email: user.email,
      full_name: fullName,
      avatar_url: avatarUrl,
    });
  
    // Handle error in inserting message
    if (error) {
      console.error("Error sending message:", error);
    } else {
      // Reset input field and fetch the updated messages
      setInput("");
      await fetchMessages(); // Ensure messages are reloaded after sending a new one
    }
  };
  

  // Render messages
  interface Message {
    id: string;
    sender_id:string
    sender_email: string;
    full_name:string;
    content: string;
    avatar_url:string;
  }

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.sender_email === currentUserEmail;
    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
        ]}
      >
        {item.avatar_url && (
          <Image
            source={{ uri: item.avatar_url}} // Display avatar
            style={styles.avatar}
          />
        ) }

        <Text style={styles.messageText}>{item.content}</Text>
        <Text style={styles.senderEmail}>
          {isCurrentUser ? "You" : item.full_name}
        </Text>
      </View>
    );
  };
  

  return (
    <>
      <View
        style={{
          alignItems: "center",
          marginBottom: 10,
          padding: 20,
          backgroundColor: "pink",
          width: "100%",
          paddingTop: 35,
        }}
      >
        <Text>Chatter</Text>
      </View>
      <View style={styles.container}>
        <FlatList
        ref={flatListRef} // Attach ref to FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          contentContainerStyle={{ paddingBottom: 10 }}
          showsVerticalScrollIndicator={false}
        />
        
      </View>
      <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={input}
            onChangeText={setInput}
          />
          <Button title="Send" onPress={sendMessage} />
        </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 10,
    backgroundColor: "#f5f5f5",
  },
  messageList: {
    flex: 1,
  },
  avatar:{
 width:24,
 height:24,
  },
  messageContainer: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: "70%",
  },
  currentUserMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#d1f7c4",
  },
  otherUserMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  messageText: {
    fontSize: 16,
  },
  senderEmail: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginRight: 10,
  },
});

export default ChatScreen;
