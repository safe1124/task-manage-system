import React, { useState } from 'react';
import { loginUser } from '../utils/api';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
} from '@chakra-ui/react';
import CustomLink from './CustomLink';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { access_token, user_id } = await loginUser(email, password);
      localStorage.setItem('token', access_token);
      localStorage.setItem('user_id', user_id);
      toast({
        title: 'ログイン成功',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push('/chat');
    } catch (error) {
      toast({
        title: 'ログイン失敗',
        description: error instanceof Error ? error.message : '不明なエラーが発生しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="md" centerContent>
      <Box p={8} maxWidth="400px" borderWidth={1} borderRadius={8} boxShadow="lg">
        <VStack spacing={4} align="flex-start" w="full">
          <Heading>ログイン</Heading>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>メールアドレス</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setEmail(e.target.value)}
                  placeholder="メールアドレスを入力"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>パスワード</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setPassword(e.target.value)}
                  placeholder="パスワードを入力"
                />
              </FormControl>
              <Button
                type="submit"
                colorScheme="blue"
                width="full"
                isLoading={isLoading}
                loadingText="ログイン中..."
              >
                ログイン
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
      <CustomLink href="/register" text="ユーザ登録はこちら" />
    </Container>
  );
};

export default LoginForm;