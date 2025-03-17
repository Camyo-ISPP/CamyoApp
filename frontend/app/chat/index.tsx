import React, { useState, useEffect, useCallback } from 'react';
import { GiftedChat, InputToolbar, MessageText } from 'react-native-gifted-chat';
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs, 
    orderBy, 
    onSnapshot, 
    updateDoc, 
    doc, 
    getDoc 
} from 'firebase/firestore';
import { database } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useSearchParams } from 'expo-router/build/hooks';
import { Text } from 'react-native';
export default function Chat({ route }: any) {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const otherUserId = searchParams.get('otherUserId')?.toString();

    interface Message {
        _id: string;
        createdAt: Date;
        text: string;
        seen: boolean;
        user: {
            _id: string;
            name?: string;
            avatar?: string;
        };
    }

    const [messages, setMessages] = useState<Message[]>([]);
    const [chatId, setChatId] = useState<string | null>(null);

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

            // Marcar los mensajes como vistos cuando son cargados
            messages.forEach(message => {
                if (message.user._id !== user.userId.toString() && !message.seen) {
                    markMessageAsSeen(chatId, message._id, user.userId.toString());
                }
            });
        });

        return unsubscribe;
    };

    const markMessageAsSeen = async (chatId: string, messageId: string, userId: string) => {
        const messageRef = doc(database, `chats/${chatId}/messages`, messageId);
        const messageSnapshot = await getDoc(messageRef);
        const messageData = messageSnapshot.data();

        if (messageData && !messageData.seen && messageData.user._id !== userId) {
            // Solo marca como visto si no se ha visto ya y el mensaje no lo envió el usuario actual
            await updateDoc(messageRef, {
                seen: true,
            });
        }
    };

    useEffect(() => {
        const setupChat = async () => {
            if (!user?.userId || !otherUserId) return;

            const userId = user.userId.toString();

            const chat = await getOrCreateChat(userId, otherUserId);
            setChatId(chat.id);

            const unsubscribe = loadMessages(chat.id);
            return () => unsubscribe();
        };

        setupChat();
    }, [user?.userId, otherUserId]);

    const onSend = useCallback(
        async (newMessages: Message[] = []) => {
            setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
            
            const { _id, createdAt, text, user } = newMessages[0];
            if (!chatId) return;

            await sendMessage(chatId, text);

            addDoc(collection(database, `chats/${chatId}/messages`), {
                _id,
                createdAt,
                text,
                seen: false, // Inicialmente, el mensaje no está visto
                user: {
                    ...user,
                    _id: user._id.toString(),
                },
            });
        },
        [chatId]
    );

    const renderMessageText = (props: any) => {
        const { currentMessage } = props;
        return (
            <>
                <MessageText {...props} />
            </>
        );
    };

    return (
        <GiftedChat
            messages={messages}
            showAvatarForEveryMessage={false}
            showUserAvatar={true}
            onSend={messages => onSend(messages)}
            messagesContainerStyle={{
                backgroundColor: '#fff',
            }}
            renderInputToolbar={props => (
                <InputToolbar
                    {...props}
                    containerStyle={{
                        backgroundColor: '#fff',
                        borderRadius: 20,
                    }}
                />
            )}
            user={{
                _id: user?.userId.toString(),
                name: user?.nombre,
                avatar: user?.foto,
            }}
            renderMessageText={renderMessageText} 
        />
    );
}
