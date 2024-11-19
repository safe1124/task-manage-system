"use client";

import { Box, VStack, Heading, Button, Container } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={8}>
        <Heading as="h1" size="xl">システムページ一覧</Heading>
        
        <Box w="100%" p={6} borderWidth={1} borderRadius="lg" shadow="md">
          <VStack spacing={4} align="stretch">
            <Button 
              colorScheme="blue" 
              size="lg"
              onClick={() => router.push("/login")}
            >
              ログインページ
            </Button>

            <Button 
              colorScheme="green" 
              size="lg"
              onClick={() => router.push("/register")}
            >
              新規登録ページ
            </Button>

            <Button 
              colorScheme="purple" 
              size="lg"
              onClick={() => router.push("/chat")}
            >
              チャットページ
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}