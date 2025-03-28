import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import ChatComponent from './chat';  // Componente de chat
import { database } from '../../../firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import colors from '@/assets/styles/colors';
import { useRouter } from 'expo-router';
import ProtectedRoute from '@/security/ProtectedRoute';
import defaultImage from "../../../assets/images/camionero.png";
import defaultEmpImage from "../../../assets/images/empresa.jpg";

interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  unreadMessagesCount: number;
  recipient:Usuario;
  lastUpdated: number;
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
          lastUpdated: data.lastUpdated?.toMillis ? data.lastUpdated.toMillis() : 0,  // 🔥 Convertir Timestamp a milisegundos
        });
      });
  
      // Ordenar los chats por la fecha de `lastUpdated` de manera descendente (más reciente primero)
      fetchedChats.sort((a, b) => b.lastUpdated - a.lastUpdated);

  
      setChats(fetchedChats);
    });
  
    return () => unsubscribe(); // Se desuscribe cuando el componente se desmonta
  }, [user?.userId]);
  
  const formatDateTime = (timestamp: number) => {
    if (!timestamp) return ""; // Evitar errores si no hay fecha
    const date = new Date(timestamp);

  
    // Obtener día y hora en formato español
    return date.toLocaleString("es-ES", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // Formato 24 horas
    });
  };

  
  
  
  const handleChatClick = (chat: Chat) => {
    const otherUserId = chat.participants.find(participant => participant !== user.userId.toString());
    if (otherUserId && userDetails[otherUserId]) {
      setCurrentChat({
        ...chat,
        recipient: userDetails[otherUserId]
      });
    } else {
      setCurrentChat(chat);
    }
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

    return (
      <View style={styles.listContainer}>
        <TouchableOpacity
          style={[styles.chatItem]}  // Aplicar estilo de chat seleccionado
          onPress={() => handleChatClick(item)}  // Usamos la función para seleccionar el chat
        >
          
          <View style={{ flex: 1 }}>

          {/* Mostrar la imagen del otro usuario */}
          <Image
            source={otherUser?.foto? { uri: otherUser?.foto }: otherUser?.authority.authority === "CAMIONERO" ? defaultImage : defaultEmpImage}
            style={styles.userImage}
          />
          {/* Nombre del usuario */}
          <Text style={styles.chatText}>{otherUser ? otherUser.nombre : `Chat with User ID: ${otherUserId}`}</Text>

          {/* Último mensaje */}
          <Text style={styles.lastMessage}>{item.lastMessage || 'No messages yet'}</Text>

          {/* Fecha y hora del último mensaje */}
          {item.lastMessage && (
            <Text style={styles.timestamp}>{formatDateTime(item.lastUpdated)}</Text>
          )}
        </View>
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
        {currentChat && <ChatComponent chat={currentChat} 
        recipientName={userDetails[currentChat.participants.find(id => id !== user?.userId)]?.nombre || "Desconocido"}
        />}  {/* Mostrar el chat seleccionado */}
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
    width: '100%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
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
    marginLeft:60,
    bottom:15,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    marginLeft:60,
    bottom:10,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 40, // Hacer la imagen circular
    top:35,
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  
});

export default ChatList;
