import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import { Bubble, Composer, ComposerProps, GiftedChat, IMessage, InputToolbar, Send, SendProps, Time } from 'react-native-gifted-chat';
import { collection, addDoc, query, orderBy, onSnapshot, updateDoc, doc, increment, limit } from 'firebase/firestore';
import { database } from '../../../firebase';
import { useAuth } from '../../../contexts/AuthContext';
import colors from '@/assets/styles/colors';
import defaultImage from "../../../assets/images/camionero.png";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import dayes from 'dayjs/locale/es'
import defaultEmpImage from "../../../assets/images/empresa.jpg";
import { Ionicons } from '@expo/vector-icons';
import { unifyUserData } from '@/utils/unifyData';
import axios from 'axios';
import { router } from 'expo-router';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
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
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
  const [otherUser, setOtherUser] = useState<any>(null);
  const [textHeight, setTextHeight] = useState(500); // Altura inicial del TextInput


  useEffect(() => {
    if (!chat || !user) return;
    const chatRef = doc(database, 'chats', chat.id);
    const updates: any = {};
    updates[`unreadCounts.${user.userId}`] = 0;
    updateDoc(chatRef, updates).catch(console.error);
  }, [chat, user]);

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

  useEffect(() => {
    const fetchRecipientData = async () => {
      try {
        let response;
        if (chat.recipient.authority?.authority === "CAMIONERO") {
          response = await axios.get(`${BACKEND_URL}/camioneros/por_usuario/${chat.recipient.id}`);
        } else if (chat.recipient.authority?.authority === "EMPRESA") {
          response = await axios.get(`${BACKEND_URL}/empresas/por_usuario/${chat.recipient.id}`);
        }
        const unifiedData = unifyUserData(response?.data);
        setOtherUser(unifiedData);
      } catch (error) {
        console.error("Error fetching recipient data:", error);
      }
    };
    fetchRecipientData();
  }, [chat.recipient, BACKEND_URL]);

  const onSend = useCallback(
    async (newMessages: Message[] = []) => {
      if (!chat || !user) return;
      setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
      const { _id, createdAt, text, user: messageUser } = newMessages[0];
      const chatRef = doc(database, 'chats', chat.id);
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
      let updates: any = {
        lastMessage: text,
        lastUpdated: new Date()
      };
      chat.participants
        .filter((p) => p !== user.userId.toString())
        .forEach((recipientId) => {
          updates[`unreadCounts.${recipientId}`] = increment(1);
        });
      await updateDoc(chatRef, updates);
    },
    [chat, user]
  );

  const renderBubble = (props: any) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: '#f0f0f0',
            borderBottomLeftRadius: 0,
            borderRadius: 16,
            marginVertical: 4,
            paddingHorizontal: 5,
            paddingVertical: 3,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
            maxWidth: '40%',
          },
          right: {
            backgroundColor: colors.primary,
            borderBottomRightRadius: 0,
            borderRadius: 16,
            marginVertical: 4,
            paddingHorizontal: 5,
            paddingVertical: 3,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 1,
            maxWidth: '60%',
          },
        }}
        textStyle={{
          left: {
            color: colors.dark,
            fontSize: 16,
            lineHeight: 22,
          },
          right: {
            color: colors.white,
            fontSize: 16,
            lineHeight: 22,
          },
        }}
        timeTextStyle={{
          left: {
            color: colors.gray,
            fontSize: 12,
            marginTop: 4,
          },
          right: {
            color: colors.lightGray,
            fontSize: 12,
            marginTop: 4,
          },
        }}
        renderTime={(timeProps) => (
          <Time
            {...timeProps}
            containerStyle={{
              left: { bottom: -4, right: -8 },
              right: { bottom: -4, left: -8 },
            }}
          />
        )}
      />
    );
  };

  const renderSend = (props: any) => {
    return (
      <Send
        {...props}
        disabled={!props.text}
        containerStyle={styles.sendContainer}
      >
        <View style={[
          styles.sendButton,
          props.text ? styles.activeSendButton : styles.inactiveSendButton
        ]}>
          <Ionicons
            name="send"
            size={20}
            color={props.text ? colors.white : colors.gray}
          />
        </View>
      </Send>
    );
  };

  const navigateToProfile = () => {
    console.log("navigateToProfile called");
    if (otherUser?.rol === "CAMIONERO") {
      router.push(`/camionero/${otherUser?.id}`);
      console.log("CAMIONERO")
    } else if (otherUser?.rol === "EMPRESA") {
      router.push(`/empresa/${otherUser?.id}`);
    }
  };

  const handleContentSizeChange = (event) => {
    const contentHeight = event.nativeEvent.contentSize.height;
    setTextHeight(contentHeight); // Actualizar la altura dinámicamente
  };

  const ChatComposer = (
    props: ComposerProps & {
      // GiftedChat passes its props to all of its `render*()`
      onSend: SendProps<IMessage>['onSend'];
      text: SendProps<IMessage>['text'];
    },
  ) => (
    <Composer
      {...props}
      textInputProps={{
        ...props.textInputProps,
        // for enabling the Return key to send a message only on web
        blurOnSubmit: Platform.OS === 'web',
        onSubmitEditing:
          Platform.OS === 'web'
            ? () => {
                if (props.text && props.onSend) {
                  props.onSend({text: props.text.trim()}, true);
                }
              }
            : undefined,
      }}
    />
  );
  
  dayjs.extend(relativeTime);
  dayjs.extend(localizedFormat);
  dayjs.locale('es'); // Configurar idioma español
  
  // Función para formatear la fecha
  const formatDate = (date: Date): string => {
    const today = dayjs().startOf('day');
    const messageDate = dayjs(date).startOf('day');
  
    if (messageDate.isSame(today, 'day')) {
      return 'Hoy'; // Si la fecha es hoy, mostrar "Hoy"
    } else {
      return dayjs(date).format('D MMM'); // Formato predeterminado para otras fechas
    }
  };


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Header with recipient info */}
      <TouchableOpacity style={styles.header} onPress={navigateToProfile}>
        <Image
          source={
            chat.recipient?.foto
              ? { uri: `data:image/png;base64,${chat.recipient.foto}` }
              : (chat.recipient?.authority?.authority === "CAMIONERO" ? defaultImage : defaultEmpImage)
          }
          style={styles.avatar}
        />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText} numberOfLines={1}>{chat.recipient?.nombre}</Text>
          <Text style={styles.statusText} numberOfLines={1}>{chat.recipient?.descripcion}</Text>
        </View>
      </TouchableOpacity>

      {/* Chat interface */}
      <GiftedChat
        renderComposer={ChatComposer}
        inverted={true}
        messages={messages}
        showAvatarForEveryMessage={false}
        onSend={messages => onSend(messages)}
        
        user={{
          _id: user?.userId.toString(),
          name: user?.nombre,
        }}
        renderBubble={renderBubble}
        renderSend={renderSend}
        renderInputToolbar={(props) => (
          <InputToolbar
            {...props}
            primaryStyle={styles.inputToolbarPrimary}
            textInputProps={{
              placeholder: 'Escribe un mensaje...',
              placeholderTextColor: colors.mediumGray2,
              style: [styles.messageInput, { height: Math.max(40, textHeight) },], // Ajustar altura dinámicamente
              maxLength: 3000,
              multiline: true,
              scrollEnabled: true,
             
              onContentSizeChange: handleContentSizeChange, // Detectar cambios en el tamaño del contenido
            }}
            containerStyle={styles.inputToolbarContainer}
            accessoryStyle={styles.accessoryStyle}
          />
        )}
        
        renderAvatar={null}
        locale={dayes}
        timeFormat="HH:mm"
        renderDay={(props) => {
          const date = props.currentMessage?.createdAt;
          return (
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>{formatDate(date)}</Text>
            </View>
          );
        }}
        ref={chatRef}
        minInputToolbarHeight={76}
        bottomOffset={Platform.OS === 'ios' ? 0 : 20}
        alwaysShowSend
        renderUsernameOnMessage
        scrollToBottom
        scrollToBottomComponent={() => (
          <View style={styles.scrollToBottom}>
            <Ionicons name="chevron-down" size={20} color={colors.white} />
          </View>
        )}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    zIndex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
  },
  statusText: {
    fontSize: 13,
    color: colors.gray,
    marginTop: 2,
  },
  inputToolbarContainer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    
    
  },
  inputToolbarPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  
  },
  accessoryStyle: {
    height: 44,
  },
  messageInput: {
    fontSize: 16,
    color: 'black',
    backgroundColor: colors.lighterGray,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    flex: 1,
    maxHeight: 120,
    textAlignVertical: 'center',
    borderWidth: 1,
    borderColor: colors.lightGray,
    scrollbarWidth: 'none',
    outlineColor: colors.mediumGray2,
  
  },
  
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginRight: 4,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeSendButton: {
    backgroundColor: colors.primary,
  },
  inactiveSendButton: {
    backgroundColor: colors.lightGray,
  },
  scrollToBottom: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 8,
    opacity: 0.8,
  },
  dateContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  dateText: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 15,
    color: colors.white,
  },
  
});

export default ChatComponent;