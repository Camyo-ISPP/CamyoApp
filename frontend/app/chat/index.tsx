import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import ChatComponent from './chat';  // Componente de chat
import { database } from '../../firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import colors from '@/assets/styles/colors';
import { useRouter } from 'expo-router';
import ProtectedRoute from '@/security/ProtectedRoute';

interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  unreadMessagesCount: number;
}

interface Usuario {
  userId: string;
  nombre: string;
  foto: string;
}

function ChatList() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [userDetails, setUserDetails] = useState<{ [key: string]: Usuario }>({});
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);  // Estado para el chat seleccionado
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  useEffect(() => {
    if (!user || !user?.userId) return;
  
    const chatsRef = collection(database, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', user.userId.toString()));
  
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (querySnapshot.empty) {
        setChats([]); // Asegurar que se vacíe la lista si no hay chats
        return;
      }
  
      const fetchedChats: Chat[] = [];
  
      querySnapshot.forEach((doc) => {
        const data = doc.data();
  
        fetchedChats.push({
          id: doc.id,
          participants: data.participants,
          lastMessage: data.lastMessage?.trim() !== "" ? data.lastMessage : "Inicia una conversación",
          unreadMessagesCount: data.unreadMessagesCount || 0,
          lastUpdated: data.lastUpdated || new Date(0), // Asegúrate de que el campo existe y es una fecha
        });
      });
  
      // Ordenar los chats por la fecha de `lastUpdated` de manera descendente (más reciente primero)
      fetchedChats.sort((a, b) => b.lastUpdated - a.lastUpdated);
  
      setChats(fetchedChats);
    });
  
    return () => unsubscribe(); // Se desuscribe cuando el componente se desmonta
  }, [user?.userId]);
  
  
  
  const handleChatClick = (chat: Chat) => {
    setCurrentChat(chat);  // Establecer el chat seleccionado en el estado
  };

  useEffect(() => {
    if (!user?.userId) return;
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

  const renderChatItem = ({ item }: { item: Chat }) => {
    if (!user?.userId) return;
    const otherUserId = item.participants.find(participant => participant !== user.userId.toString());
    const otherUser = otherUserId ? userDetails[otherUserId] : null;

    const isSelected = currentChat?.id === item.id;  // Verificar si este chat es el seleccionado

    return (
      <View style={styles.listContainer}>
        <TouchableOpacity
          style={[styles.chatItem, isSelected && styles.selectedChatItem]}  // Aplicar estilo de chat seleccionado
          onPress={() => handleChatClick(item)}  // Usamos la función para seleccionar el chat
        >
          <Text style={styles.chatText}>{otherUser ? otherUser.nombre : `Chat with User ID: ${otherUserId}`}</Text>
          <Text style={styles.lastMessage}>{item.lastMessage || 'No messages yet'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ProtectedRoute>
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={item => item.id}
        renderItem={renderChatItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No chats available</Text>}
      />
      <View style={{ flex: 10 }}>
        {currentChat && <ChatComponent chat={currentChat} />}  {/* Mostrar el chat seleccionado */}
      </View>
    </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',  // Para mostrar los chats y el chat en paralelo
    paddingTop: 80,
    backgroundColor: '#fff',
    marginRight: 0,
  },
  listContainer: {
    width: "100%"
  },
  chatItem: {
    paddingVertical: 0, // Reducir el padding superior e inferior
    paddingHorizontal: 15,
    flexBasis: 120,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
  },
  selectedChatItem: {
    backgroundColor: '#FFE4B5',  // Color de fondo para el chat seleccionado
    borderLeftWidth: 4,  // Resaltar con borde izquierdo
    borderLeftColor: colors.secondary,  // Color del borde
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
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
});

export default ChatList;
