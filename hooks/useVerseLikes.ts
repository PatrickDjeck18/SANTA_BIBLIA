import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LIKED_VERSES_KEY = '@liked_verses';

interface LikedVerses {
  [verseReference: string]: boolean;
}

export function useVerseLikes(verseReference: string, verseText: string) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load like status from local storage
  const checkLikeStatus = useCallback(async () => {
    try {
      const storedLikes = await AsyncStorage.getItem(LIKED_VERSES_KEY);
      if (storedLikes) {
        const likes: LikedVerses = JSON.parse(storedLikes);
        const userLiked = !!likes[verseReference];
        setIsLiked(userLiked);

        // For local simulation, we can validly say if the user liked it, the count is at least 1.
        // We can also potentially store a "fake" Global count if we wanted, but let's keep it simple.
        // If the user likes it, count is 1, else 0.
        // Or we could randomize it to make it feel alive, but let's stick to functional correctness first.
        setLikeCount(userLiked ? 1 : 0);
      } else {
        setIsLiked(false);
        setLikeCount(0);
      }
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  }, [verseReference]);

  useEffect(() => {
    checkLikeStatus();
  }, [checkLikeStatus]);

  const toggleLike = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const storedLikes = await AsyncStorage.getItem(LIKED_VERSES_KEY);
      let likes: LikedVerses = storedLikes ? JSON.parse(storedLikes) : {};

      const newStatus = !isLiked;

      if (newStatus) {
        likes[verseReference] = true;
      } else {
        delete likes[verseReference];
      }

      await AsyncStorage.setItem(LIKED_VERSES_KEY, JSON.stringify(likes));

      setIsLiked(newStatus);
      setLikeCount(newStatus ? 1 : 0);

    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    isLiked,
    likeCount,
    toggleLike,
    loading,
  };
}

