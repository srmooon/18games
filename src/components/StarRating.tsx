'use client';

import { HStack, Text } from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';

interface StarRatingProps {
  rating: number;
  showNumber?: boolean;
}

export default function StarRating({ rating, showNumber = true }: StarRatingProps) {
  return (
    <HStack spacing={2} align="center">
      <HStack spacing={1}>
        {[...Array(5)].map((_, index) => (
          <StarIcon
            key={index}
            color={index < Math.floor(rating) ? 'yellow.400' : 'gray.300'}
            w={4}
            h={4}
          />
        ))}
      </HStack>
      {showNumber && (
        <Text fontWeight="bold" ml={2}>
          {rating.toFixed(1)}
        </Text>
      )}
    </HStack>
  );
}
