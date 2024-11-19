import { Link as ChakraLink } from "@chakra-ui/react";
import NextLink from "next/link";

interface CustomLinkProps {
  href: string;
  text: string;
}

const CustomLink: React.FC<CustomLinkProps> = ({ href, text }) => (
    <NextLink href={href} passHref legacyBehavior>
        <ChakraLink color="blue.500" textDecoration="underline">
        {text}
        </ChakraLink>
    </NextLink>
);
export default CustomLink;