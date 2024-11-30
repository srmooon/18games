'use client';

import { useState, useEffect, useCallback } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, increment } from 'firebase/firestore';
import { User } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  photoURL: string;
  bannerURL: string;
  role: 'membro' | 'vip' | 'vip+' | 'admin';
  createdAt: string;
  description: string;
  postCount: number;
  rating: number;
  totalRatings: number;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      return onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setProfile({
            uid: user.uid,
            email: user.email || '',
            displayName: data.displayName || '',
            username: data.username || '',
            photoURL: data.photoURL || '',
            bannerURL: data.bannerURL || '',
            role: data.role || 'membro',
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            description: data.description || '',
            postCount: data.postCount || 0,
            rating: data.rating || 0,
            totalRatings: data.totalRatings || 0,
          } as UserProfile);
        }
        setLoading(false);
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setLoading(false);
      return () => {};
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    let unsubProfile: (() => void) | undefined;

    const unsubAuth = auth.onAuthStateChanged((user) => {
      setUser(user);
      
      if (user) {
        loadProfile(user).then(unsub => {
          unsubProfile = unsub;
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubProfile) {
        unsubProfile();
      }
    };
  }, [loadProfile]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, updates);
  };

  const addPost = async () => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      postCount: increment(1)
    });
  };

  const addRating = async (rating: number) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      rating: increment(rating),
      totalRatings: increment(1)
    });
  };

  return {
    user,
    profile,
    loading,
    updateProfile,
    addPost,
    addRating,
  };
}
