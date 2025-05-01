import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Animated, TextInput } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import ChatComponent from './chat';
import { database } from '../../../firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import colors from '@/assets/styles/colors';
import { useRouter } from 'expo-router';
import ProtectedRoute from '@/security/ProtectedRoute';
import defaultImage from "../../../assets/images/camionero.png";
import defaultEmpImage from "../../../assets/images/empresa.jpg";
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from "expo-router";

interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  unreadCounts: { [key: string]: number };
  unreadMessagesCount: number;
  lastUpdated: number;
}

interface Usuario {
  userId: string;
  nombre: string;
  foto: string;
  authority?: {
    authority: string;
  };
}

function ChatList() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [userDetails, setUserDetails] = useState<{ [key: string]: Usuario }>({});
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
  const { chatId } = useLocalSearchParams();

  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Chat data fetching
  useEffect(() => {
    if (!user || !user?.userId) return;

    const chatsRef = collection(database, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', user.userId.toString()));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (querySnapshot.empty) {
        setChats([]);
        setFilteredChats([]);
        return;
      }

      const fetchedChats: Chat[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedChats.push({
          id: doc.id,
          participants: data.participants,
          lastMessage: data.lastMessage?.trim() !== "" ? data.lastMessage : "Inicia una conversación",
          unreadCounts: data.unreadCounts || {},
          unreadMessagesCount: data.unreadMessagesCount || 0,
          lastUpdated: data.lastUpdated?.toMillis ? data.lastUpdated.toMillis() : 0,
        });
      });

      fetchedChats.sort((a, b) => b.lastUpdated - a.lastUpdated);
      setChats(fetchedChats);
      setFilteredChats(fetchedChats);
    });

    return () => unsubscribe();
  }, [user?.userId]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredChats(chats);
      return;
    }

    const filtered = chats.filter(chat => {
      const otherUserId = chat.participants.find(participant => participant !== user?.userId.toString());
      const otherUser = otherUserId ? userDetails[otherUserId] : null;
      return otherUser?.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    });

    setFilteredChats(filtered);
  }, [searchQuery, chats, userDetails]);

  const formatDateTime = (timestamp: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString("es-ES", {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "Ayer";
    }
    
    return date.toLocaleDateString("es-ES", {
      day: '2-digit',
      month: 'short',
    });
  };

  useEffect(() => {
    if (chatId && chats.length > 0) {
      const selectedChat = chats.find(chat => chat.id === chatId);
      if (selectedChat) {
        console.log("chat" + selectedChat)
        handleChatClick(selectedChat); // Selecciona el chat automáticamente
      }
    }
  }, [chatId, chats]);

  
  const handleChatClick = (chat: Chat) => {
    const otherUserId = chat.participants.find(participant => participant !== user?.userId.toString());
    if (otherUserId && userDetails[otherUserId]||chatId) {
      setCurrentChat({
        ...chat,
        recipient: userDetails[otherUserId]
      });
    } else {
      setCurrentChat(chat);
      
    }
  };

  // User details fetching
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

  const renderChatItem = ({ item, index }: { item: Chat; index: number }) => {
    if (!user?.userId) return null;
    const otherUserId = item.participants.find(participant => participant !== user.userId.toString());
    const otherUser = otherUserId ? userDetails[otherUserId] : null;
    const isSelected = currentChat?.id === item.id;
    const unreadCount = item.unreadCounts?.[user.userId] || 0;

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <TouchableOpacity
          style={[
            styles.chatItem,
            isSelected && styles.selectedChatItem,
            unreadCount > 0 && styles.unreadChatItem
          ]}
          onPress={() => handleChatClick(item)}
        >
        <Image
            source={otherUser?.foto ? { uri: `data:image/png;base64,${otherUser.foto}` } : 
                    otherUser?.authority?.authority === "CAMIONERO" ? defaultImage : defaultEmpImage}
            style={styles.userImage}
        />
          
          <View style={styles.chatContent}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatName} numberOfLines={1}>
                {otherUser ? otherUser.nombre : `Usuario ${otherUserId?.substring(0, 6)}`}
              </Text>
              <Text style={styles.chatTime}>
                {formatDateTime(item.lastUpdated)}
              </Text>
            </View>
            
            <View style={styles.chatPreview}>
              <Text 
                style={[
                  styles.lastMessage,
                  unreadCount > 0 && styles.unreadMessage
                ]} 
                numberOfLines={1}
              >
                {item.lastMessage || 'No messages yet'}
              </Text>
              
              {unreadCount > 0 && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>
                    {unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        {/* Chat List Sidebar */}
        <View style={styles.chatListContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Mensajes</Text>
            <TouchableOpacity onPress={() => {setIsSearching(!isSearching);setSearchQuery('')}}>
              <Ionicons name={isSearching ? "close" : "search"} size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          {isSearching && (
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar conversaciones..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={true}
              />
            </View>
          )}
          
          {filteredChats.length > 0 ? (
            <FlatList
              data={filteredChats}
              keyExtractor={item => item.id}
              renderItem={renderChatItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Animated.View 
              style={[
                styles.emptyState,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              <MaterialIcons 
                name={searchQuery ? "search-off" : "chat"} 
                size={60} 
                color={colors.lightGray} 
              />
              <Text style={styles.emptyTitle}>
                {searchQuery ? "No se encontraron resultados" : "No tienes conversaciones"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? "Intenta con otro término" : "Inicia una nueva conversación"}
              </Text>
            </Animated.View>
          )}
        </View>
        
        {/* Chat Content Area */}
        <View style={styles.chatArea}>
          {currentChat ? (
            <ChatComponent 
              chat={currentChat}
              recipientName={userDetails[currentChat.participants.find(id => id !== user?.userId) || ""]?.nombre || "Desconocido"}
            />
          ) : (
            <Animated.View 
              style={[
                styles.emptyChat,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              <MaterialIcons name="forum" size={80} color={colors.lightGray} />
              <Text style={styles.emptyChatTitle}>Selecciona una conversación</Text>
              <Text style={styles.emptyChatText}>Elige un chat de la lista para empezar a hablar</Text>
            </Animated.View>
          )}
        </View>
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  chatListContainer: {
    width: 350,
    borderRightWidth: 1,
    borderRightColor: '#eaeaea',
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.primary,
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#333',
    outlineColor:colors.mediumGray2
  },
  listContent: {
    paddingBottom: 20,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  selectedChatItem: {
    backgroundColor: '#f5f5f5',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  unreadChatItem: {
    backgroundColor: '#f8f9fe',
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  chatTime: {
    fontSize: 12,
    color: '#999',
  },
  chatPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 10,
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#333',
  },
  badgeContainer: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    paddingHorizontal: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginTop: 20,
    marginBottom: 5,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  chatArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyChatTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#555',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyChatText: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    maxWidth: 300,
  },
});

export default ChatList;