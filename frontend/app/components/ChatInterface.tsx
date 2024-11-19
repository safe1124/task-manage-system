import React, { useState, useEffect } from 'react';
import { Box, Flex, Input, Button, VStack, Text } from '@chakra-ui/react';
import { sendMessage, getMessages } from '../utils/api';

interface Message {
  id: string;
  user_id: string;
  user_name: string;
  message: string;
  timestamp: string;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const currentUserId = localStorage.getItem('user_id');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const fetchedMessages = await getMessages();
    setMessages(fetchedMessages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendMessage(newMessage);
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      alert('メッセージ送信失敗: ' + error);
    }
  };

  return (
    <Box bg="gray.100" h="100vh" p={4}>
      <VStack spacing={4} align="stretch" h="calc(100vh - 80px)" overflowY="auto">
        {messages.map((msg) => (
          <Flex key={msg.id} justify={msg.user_id === currentUserId ? 'flex-end' : 'flex-start'}>
            <Box
              maxW="70%"
              bg={msg.user_id === currentUserId ? 'blue.500' : 'white'}
              color={msg.user_id === currentUserId ? 'white' : 'black'}
              borderRadius="lg"
              p={2}
              boxShadow="md"
            >
              {msg.user_id !== currentUserId && (
                <Text fontSize="xs" fontWeight="bold" mb={1}>
                  {msg.user_name}
                </Text>
              )}
              <Text>{msg.message}</Text>
              <Text fontSize="xs" textAlign="right" mt={1}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </Text>
            </Box>
          </Flex>
        ))}
      </VStack>
      <Flex as="form" onSubmit={handleSubmit} position="fixed" bottom={4} left={4} right={4}>
        <Input
          bg="white"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="メッセージを入力"
          mr={2}
          required
        />
        <Button type="submit" colorScheme="blue">
          送信
        </Button>
      </Flex>
    </Box>
  );
};

export default ChatInterface;