import { collection, query, where, getDocs, addDoc, orderBy, onSnapshot } from 'firebase/firestore';
import { database } from '../../../firebase';

// Function to get or create a chat between two users
export const getOrCreateChat = async (userId1: string | number, userId2: string | number) => {
  const chatsRef = collection(database, 'chats');

  // Convertir IDs a string para mantener consistencia en Firestore
  const userId1Str = userId1.toString();
  const userId2Str = userId2.toString();

  // Check if a chat already exists between the two users
  const q = query(chatsRef, where('participants', 'array-contains', userId1Str));
  const querySnapshot = await getDocs(q);

  let chat = null;

  querySnapshot.forEach(doc => {
    const data = doc.data();
    if (data.participants.includes(userId2Str)) {
      chat = { id: doc.id, ...data };
    }
  });


  // If chat exists, return it
  if (chat) {
    return chat;
  }

  // If chat doesn't exist, create a new one
  if (!chat) {
    const newChat = await addDoc(chatsRef, {
      participants: [userId1Str, userId2Str],
      // Aquí agregas el objeto unreadCounts
      unreadCounts: {
        [userId1Str]: 0,
        [userId2Str]: 0
      },
      lastMessage: '',
      lastUpdated: new Date()
    });
    return { id: newChat.id, participants: [userId1Str, userId2Str] };
  }
};

// Function to load messages for a specific chat
export const loadMessages = (chatId: string, setMessages: Function) => {
  const messagesRef = collection(database, `chats/${chatId}/messages`);
  const q = query(messagesRef, orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(q, querySnapshot => {
    const messages = querySnapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    }));
    setMessages(messages);
  });

  return unsubscribe;
};

export const startChat = async (senderId: number, receiverId: number) => {
  try {
    const chatsRef = collection(database, 'chats');

    // Convertir los IDs a cadenas para comparaciones en Firestore
    const senderIdStr = senderId.toString();
    const receiverIdStr = receiverId.toString();

    // Buscar si ya existe un chat entre los dos usuarios
    const q = query(chatsRef, where('participants', 'array-contains', senderIdStr));
    const querySnapshot = await getDocs(q);

    let chatId: string | null = null;

    querySnapshot.forEach(doc => {
      const data = doc.data();
      if (data.participants.includes(receiverIdStr)) {
        chatId = doc.id; // Chat ya existe
      }
    });

    // Si no existe un chat, crearlo
    if (!chatId) {
      const newChat = await addDoc(chatsRef, {
        participants: [senderIdStr, receiverIdStr],
        unreadCounts: {
          [senderIdStr]: 0,
          [receiverIdStr]: 0
        },
        lastMessage: '', // Inicializa con un mensaje vacío
        lastUpdated: new Date(), // Marca de tiempo para ordenar
      });
      chatId = newChat.id;
    }

    return chatId;
  } catch (error) {
    console.error('Error starting chat:', error);
    return null;
  }
};
