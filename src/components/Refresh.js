import React, { useState, useCallback } from 'react';
import { ScrollView, RefreshControl, StyleSheet, View } from 'react-native';

/**
 * Refresh Component
 * A wrapper component that adds "Pull-to-Refresh" functionality to any screen.
 * 
 * Props:
 * - onRefresh: (Async Function) Function to call when the user pulls down. Should return a Promise.
 * - refreshing: (Boolean) Optional. External control for refreshing state.
 * - style: (Object) Style for the container/ScrollView.
 * - children: (React Node) The content to be rendered inside the scroll view.
 */
const Refresh = ({ onRefresh, children, style, ...props }) => {
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        if (onRefresh && typeof onRefresh === 'function') {
            try {
                // Call the onRefresh function passed from parent
                await onRefresh();
            } catch (error) {
                console.error("Refresh failed:", error);
            }
        }
        setRefreshing(false);
    }, [onRefresh]);

    return (
        <ScrollView
            contentContainerStyle={[styles.scrollViewContent, style]}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={['#7C3AED']} // Primary purple color
                    tintColor="#7C3AED"  // For iOS
                />
            }
            {...props}
        >
            {children}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollViewContent: {
        flexGrow: 1,
    },
});

export default Refresh;
