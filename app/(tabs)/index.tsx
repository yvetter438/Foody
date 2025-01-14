import VideoPost from '@/components/VideoPost';
import { View,  StyleSheet, FlatList  } from 'react-native';
import { useState, useRef, useEffect, useCallback } from 'react';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { runOnJS } from 'react-native-reanimated';
import { useActivePost } from '@/context/ActivePostContext';
import { useFocusEffect } from '@react-navigation/native';

export default function Tab() {
  const { activePostId, setActivePostId}  = useActivePost();
  const [posts, setPosts] = useState([]);
  const [isAppActive, setIsAppActive] = useState(true);
  const [isFocused, setIsFocused] = useState(true);

  const shouldPlay = isFocused && isAppActive;

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      
      return () => {
        setIsFocused(false);
      };
    }, [])
  );


  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Fetch data from the Supabase table
        const { data, error } = await supabase
          .from('posts') // Replace 'videos' with the name of your Supabase table
          .select('id, video_url, description');
  
        if (error) {
          console.error('Error fetching posts:', error);
          return;
        }
  
        // Convert id to string and map the data into the desired format
        const formattedData = data.map((item) => ({
          id: item.id.toString(),
          video_url: item.video_url,
          description: item.description,
        }));
  
        // Update the state with fetched posts
        setPosts(formattedData);

        //set the first post as active if available
        if (formattedData.length > 0) {
          setActivePostId(formattedData[0].id);
        //  console.log('Initial activePostId set to:', formattedData[0].id); // Log initial activePostId
        }
      } catch (err) {
        console.error('Unexpected error fetching posts:', err);
      }
    };
  
    fetchPosts();
  }, []);
  

  const onEndReached = async () => {
    try {
      // Fetch the next batch of posts
      const { data, error } = await supabase
        .from('posts')
        .select('id, video_url, description')
        .range(posts.length, posts.length + 10); // Fetch next 10 posts
  
      if (error) {
        console.error('Error fetching more posts:', error);
        return;
      }
  
      if (data.length === 0) {
        // Instead of appending to existing posts, replace with initial set
        const { data: initialPosts } = await supabase
          .from('posts')
          .select('id, video_url, description')
          .range(0, 0);
  
        const formattedPosts = initialPosts.map((item) => ({
          id: item.id.toString(),
          video_url: item.video_url,
          description: item.description,
        }));
  
        setPosts(formattedPosts);
        setActivePostId(formattedPosts[0].id);
      } else {
        // Append fetched posts to the current list
        const additionalPosts = data.map((item) => ({
          id: item.id.toString(),
          video_url: item.video_url,
          description: item.description,
        }));
  
        setPosts((currentPosts) => [...currentPosts, ...additionalPosts]);
      }
    } catch (err) {
      console.error('Unexpected error fetching more posts:', err);
    }
  };
  
///previous activePostId does not get registered
  const viewabilityConfigCallbackPairs = useRef([
      {
        viewabilityConfig: { itemVisiblePercentThreshold: 50 },
      onViewableItemsChanged: ({ changed, viewableItems }) => {
        if (viewableItems.length > 0 && viewableItems[0].isViewable) {
        //  console.log('Previous activePostId:', activePostId); // Log previous activePostId
        //  console.log('New activePostId:', viewableItems[0].item.id); // Log new activePostId
          setActivePostId(viewableItems[0].item.id); 
        }
      },
    },
  ]);

  const swipeGesture = Gesture.Pan()
    .activeOffsetX(50) // Start detecting after 50px horizontal movement
    .onEnd((event) => {
    //  console.log('Swipe event:', event) //debug log
      if (event.velocityX > 500) { // Swipe right with good velocity
        runOnJS(router.push)(`/(tabs)/recipe?id=${activePostId}`);
      }
    });


  return (
    <GestureHandlerRootView style={{ flex: 1}}>
      <GestureDetector gesture={swipeGesture}>
      <View style={styles.container}>
        <FlatList
        data={posts} 
        renderItem={({ item }) => <VideoPost post={item} activePostId={activePostId} shouldPlay={shouldPlay}/>}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        pagingEnabled
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={1}
      />
      </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});
