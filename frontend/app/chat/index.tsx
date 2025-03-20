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
import { useRouter } from 'expo-router';
import withNavigationGuard from '@/hoc/withNavigationGuard';
import ProtectedRoute from '../../security/ProtectedRoute';

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

function Chat({ route }: any) {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const otherUserId = searchParams.get('otherUserId')?.toString();

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
                if (user && message.user._id !== user.userId.toString() && !message.seen) {
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
            await updateDoc(messageRef, { seen: true });
        }
    };

    useEffect(() => {
        if (!otherUserId) {
            router.replace("/chat/list");
            return;
        }
        const setupChat = async () => {
            if (!user || !user.userId || !otherUserId) return;

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
            if (!chatId || !user) return;

            setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
            
            const { _id, createdAt, text, user: messageUser } = newMessages[0];

            await sendMessage(chatId, text);

            addDoc(collection(database, `chats/${chatId}/messages`), {
                _id,
                createdAt,
                text,
                seen: false, // Inicialmente, el mensaje no está visto
                user: {
                    ...messageUser,
                    _id: messageUser._id.toString(),
                },
            });
        },
        [chatId, user]
    );

    return (
        <ProtectedRoute>
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
            renderMessageText={(props) => <MessageText {...props} />}
        />
        </ProtectedRoute>
    );
}

// Exportamos el componente envuelto con el HOC `withNavigationGuard`
export default withNavigationGuard(Chat);
