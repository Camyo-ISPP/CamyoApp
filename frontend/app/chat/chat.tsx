import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bubble, GiftedChat, InputToolbar } from 'react-native-gifted-chat';
import { collection, addDoc, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { database } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import colors from '@/assets/styles/colors';

interface Message {
  _id: string;
  createdAt: Date;
  text: string;
  seen: boolean;
  user: {
    _id: string;
    name?: string;
  };
}

interface ChatComponentProps {
  chat: Chat;  // Recibimos el chat seleccionado como propiedad
}

function ChatComponent({ chat }: ChatComponentProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const chatRef = useRef<any>();  // Referencia a GiftedChat para controlar el desplazamiento

  const getOrCreateChat = async (userId1: string, userId2: string) => {
    const chatsRef = collection(database, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', userId1));
    const querySnapshot = await getDocs(q);

    let chat = null;

    querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.participants.includes(userId2)) {
            chat = { id: doc.id, ...data };
        }
    });

    if (chat) {
        return chat;
    }

    const newChat = await addDoc(chatsRef, {
        participants: [userId1, userId2],
    });

    return { id: newChat.id, participants: [userId1, userId2] };
};

  const sendMessage = async (chatId: string, messageText: string) => {
    try {
      const chatDocRef = doc(database, 'chats', chatId);
      await updateDoc(chatDocRef, {
        lastMessage: messageText, 
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error('Error updating chat:', error);
    }
  };

  const loadMessages = (chatId: string) => {
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

  useEffect(() => {
    if (chat) {
      loadMessages(chat.id);
    }
  }, [chat]);

  const onSend = useCallback(
    async (newMessages: Message[] = []) => {
      if (!chat || !user) return;

      setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));

      const { _id, createdAt, text, user: messageUser } = newMessages[0];

      await sendMessage(chat.id, text);

      addDoc(collection(database, `chats/${chat.id}/messages`), {
        _id,
        createdAt,
        text,
        seen: false,
        user: { ...messageUser, _id: messageUser._id.toString() },
      });
      
    },
    [chat, user]
  );


  return (
    <GiftedChat
      inverted={true}
      messages={messages}
      showAvatarForEveryMessage={true}
      onSend={messages => onSend(messages)}
      user={{
        _id: user?.userId.toString(),
        name: user?.nombre,
      }}
      renderBubble={(props) => (
        <Bubble
          {...props}
          wrapperStyle={{
            left: { backgroundColor: colors.lightOrange },
            right: { backgroundColor: colors.lightBlue },
          }}
          textStyle={{
            left: { color: colors.white, fontSize: 20 },
            right: { color: colors.white, fontSize: 20 },
          }}
          timeTextStyle={{
            left: { color: colors.white, fontSize: 12 },
            right: { color: colors.white, fontSize: 12 },
          }}
        />
      )}
      ref={chatRef}  // Asignamos la referencia aquí
    />
  );
}

export default ChatComponent;
