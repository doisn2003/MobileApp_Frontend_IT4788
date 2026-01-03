import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { Surface, IconButton } from 'react-native-paper';
import debounce from 'lodash.debounce';

const Search = ({ 
    placeholder = "Tìm kiếm...", 
    onSearch,          
    onFilterPress,      
    loading = false,
    containerStyle = {} 
}) => {
    const [query, setQuery] = useState('');

    // Debounce: Đợi người dùng ngừng gõ 500ms
    const delayedSearch = useCallback(
        debounce((text) => {
            if (onSearch) onSearch(text);
        }, 500),
        [onSearch]
    );

    const handleTextChange = (text) => {
        setQuery(text);
        delayedSearch(text);
    };

    const clearSearch = () => {
        setQuery('');
        if (onSearch) onSearch('');
    };

    return (
        <View style={[styles.container, containerStyle]}>
            <Surface style={styles.searchSection} elevation={0}>
                <View style={styles.searchInner}>
                    {loading ? (
                        <ActivityIndicator size={20} color="#7C3AED" style={styles.searchIcon} />
                    ) : (
                        <IconButton 
                            icon="magnify" 
                            size={20} 
                            iconColor="#666" 
                            style={styles.searchIcon} 
                        />
                    )}
                    
                    <TextInput
                        style={styles.input}
                        placeholder={placeholder}
                        placeholderTextColor="#999"
                        value={query}
                        onChangeText={handleTextChange}
                        autoCapitalize="none"
                        underlineColorAndroid="transparent"
                    />
                    
                    {query.length > 0 && (
                        <TouchableOpacity onPress={clearSearch}>
                            <IconButton icon="close-circle" size={20} iconColor="#666" />
                        </TouchableOpacity>
                    )}
                </View>

                {onFilterPress && (
                    <TouchableOpacity 
                        style={styles.filterButton} 
                        activeOpacity={0.7}
                        onPress={onFilterPress}
                    >
                        <IconButton icon="filter-variant" size={24} iconColor="#FFF" />
                    </TouchableOpacity>
                )}
            </Surface>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: 'transparent',
    },
    searchSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    searchInner: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6', 
        borderRadius: 15, 
        paddingHorizontal: 4,
        height: 48,
    },
    searchIcon: { 
        margin: 0 
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#333',
        height: '100%',
        paddingRight: 10,
    },
    filterButton: {
        backgroundColor: '#7C3AED', 
        width: 48,
        height: 48,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
});

export default Search;