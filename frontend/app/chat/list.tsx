import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button } from 'react-native';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { database } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import colors from '@/assets/styles/colors';
import routes from '../_components/routes';

interface Chat {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastUpdated?: Date;
  unreadMessagesCount: number;
}

interface Usuario {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  localizacion: string;
  descripcion: string;
  foto?: string | null;
}

export default function ChatList() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [userDetails, setUserDetails] = useState<{ [key: string]: Usuario }>({});
  const router = useRouter();
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  useEffect(() => {
    if (!user?.userId || !user) return;

    const fetchChats = () => {
      const chatsRef = collection(database, 'chats');
      const q = query(chatsRef, where('participants', 'array-contains', user.userId.toString()));

      const unsubscribe = onSnapshot(q, async querySnapshot => {
        const chatList = await Promise.all(querySnapshot.docs.map(async doc => {
          const chatData = doc.data() as Chat;
          const chatId = doc.id;
          
          const messagesRef = collection(database, `chats/${chatId}/messages`);
          const messagesQuery = query(messagesRef, where('read', '==', false), where('user._id', '!=', user.userId.toString()));
          const messagesSnapshot = await getDocs(messagesQuery);
          const unreadMessagesCount = messagesSnapshot.size;

          return {
            id: chatId,
            unreadMessagesCount,
            ...chatData,
          };
        }));

        setChats(chatList);
      });

      return unsubscribe;
    };

    const unsubscribe = fetchChats();
    return () => unsubscribe();
  }, [user?.userId]);

  useEffect(() => {
    const fetchUserDetails = async (otherUserId: string) => {
      try {
        const response = await fetch(`${BACKEND_URL}/usuarios/${otherUserId}`);
        if (!response.ok) throw new Error('Error fetching user data');
        const data: Usuario = await response.json();
        setUserDetails(prev => ({ ...prev, [otherUserId]: data }));
      } catch (err) {
        console.error(err);
      }
    };

    chats.forEach(chat => {
      const otherUserId = chat.participants.find(participant => participant !== user.userId.toString());
      if (otherUserId && !userDetails[otherUserId]) {
        fetchUserDetails(otherUserId);
      }
    });
  }, [chats, user?.userId, userDetails]);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.loginMessage}>Inicie sesión para acceder a la mensajería</Text>
        <TouchableOpacity style={styles.shareButton} onPress={() => router.replace(routes.login)}><Text style={styles.shareText}>Acceder</Text></TouchableOpacity>
      </View>
    );
  }

  const renderChatItem = ({ item }: { item: Chat }) => {
    const otherUserId = item.participants.find(participant => participant !== user.userId.toString());
    const otherUser = otherUserId ? userDetails[otherUserId] : null;

    return (
      <TouchableOpacity
        style={[styles.chatItem, item.unreadMessagesCount > 0 && styles.unreadChatItem]}
        onPress={() => router.push(`/chat?otherUserId=${otherUserId}`)}
      >
        <Text style={styles.chatText}>{otherUser ? otherUser.nombre : `Chat with User ID: ${otherUserId}`}</Text>
        <Text style={styles.lastMessage}>{item.lastMessage || 'No messages yet'}</Text>
        {item.unreadMessagesCount > 0 && (
          <View style={styles.unreadCount}>
            <Text style={styles.unreadCountText}>{item.unreadMessagesCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Chats</Text>
      <FlatList
        data={chats}
        keyExtractor={item => item.id}
        renderItem={renderChatItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No chats available</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  chatItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
  },
  unreadChatItem: {
    backgroundColor: '#f0f8ff',
  },
  chatText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  unreadCount: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'red',
    borderRadius: 12,
    padding: 5,
  },
  unreadCountText: {
    color: '#fff',
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
  loginMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  shareButton: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      borderWidth: 2,
      borderRadius: 20,
      paddingVertical: 10,
      paddingHorizontal: 20,
      marginVertical: 5,
      margin: 2,
    },
    shareText: {
      color: colors.white,
      marginHorizontal: 10,
      fontWeight: "bold",
    },
});
