import React, { useState } from 'react';
import { registerUser } from '../utils/api';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
  useToast,
} from '@chakra-ui/react';
import CustomLink from './CustomLink';

const RegisterForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await registerUser(username, email, password);
      toast({
        title: '登録成功',
        description: 'アカウントが正常に作成されました。',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: '登録失敗',
        description: error instanceof Error ? error.message : '不明なエラーが発生しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="md" py={12}>
      <Box borderWidth={1} borderRadius={8} boxShadow="lg" p={8} bg="white">
        <VStack spacing={4} align="flex-start" w="full">
          <Heading as="h2" size="xl" textAlign="center" w="full">
            ユーザー登録
          </Heading>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>ユーザー名</FormLabel>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ユーザー名を入力"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>メールアドレス</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="メールアドレスを入力"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>パスワード</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワードを入力"
                />
              </FormControl>
              <Button
                type="submit"
                colorScheme="blue"
                width="full"
                mt={4}
                isLoading={isLoading}
                loadingText="登録中..."
              >
                登録
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
      <CustomLink href="/login" text="ログイン画面はこちら" />
    </Container>
  );
};

export default RegisterForm;