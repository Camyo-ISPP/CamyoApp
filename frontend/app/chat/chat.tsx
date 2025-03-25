import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Bubble, GiftedChat, InputToolbar, Send } from 'react-native-gifted-chat';
import { collection, addDoc, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { database } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import colors from '@/assets/styles/colors';
import defaultImage from "../../assets/images/camionero.png";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import dayes from 'dayjs/locale/es'
import defaultEmpImage from "../../assets/images/empresa.jpg";

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
  chat: Chat;
  recipientName: string;
  recipientPhoto: string;
}

function ChatComponent({ chat }: ChatComponentProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const chatRef = useRef<any>();

  useEffect(() => {
    if (chat) {
      const messagesRef = collection(database, `chats/${chat.id}/messages`);
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
    }
  }, [chat]);

  const onSend = useCallback(
    async (newMessages: Message[] = []) => {
      if (!chat || !user) return;
      setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
      const { _id, createdAt, text, user: messageUser } = newMessages[0];
      await updateDoc(doc(database, 'chats', chat.id), {
        lastMessage: text,
        lastUpdated: new Date(),
      });
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
    <View style={{ flex: 1 }}>
      {/* Barra superior con el nombre y la foto del usuario */}
      <View style={styles.header}>
        <Image source={chat.recipient.authority.authority === "CAMIONERO" ? defaultImage : defaultEmpImage} style={styles.avatar} />
        <Text style={styles.headerText}>{chat.recipient.nombre}</Text>
      </View>
      
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
              left: { backgroundColor: colors.primary },
              right: { backgroundColor: colors.secondary },
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
        renderSend={(props) => (
          <Send {...props}
          alwaysShowSend
          containerStyle={styles.sendButtonContainer}>
            <View style={styles.sendButtonContainer}>
            <FontAwesome name="send" size={35} color={colors.primary} />
            </View>
          </Send>
          )}
          renderInputToolbar={(props) => (
            <InputToolbar {...props} 
            textInputProps={{
              placeholder: 'Escribe un mensaje...', 
              style: {
                fontSize: 20, 
                color: '#333', 
                paddingVertical: 3,
                paddingHorizontal: 10, 
                borderRadius: 20, 
                backgroundColor: colors.lightGray, 
                flex: 0.95,
                textAlignVertical: 'center',
                height:40,

              },
              }}
            containerStyle={styles.inputToolbar}>
              
              
            </InputToolbar>
            )}
            locale={dayes} // Configuración para idioma español
            timeFormat="HH:mm" // Configura la hora en formato de 24 horas
        ref={chatRef}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height:80,
    borderRadius: 70,
    marginRight: 10,
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  inputToolbar: {
    backgroundColor: colors.white,
    opacity:0.799,
    borderRadius: 30,
    padding: 8,
    marginTop: 10,
    marginLeft:35,
    marginRight: 35,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  sendButtonContainer: {
    alignItems: 'center',
    position: 'relative',
    left:10,
    bottom:1,

  },

});

export default ChatComponent;