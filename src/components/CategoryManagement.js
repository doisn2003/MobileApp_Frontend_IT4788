import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Modal,
    StyleSheet,
    FlatList,
    Alert,
    TouchableOpacity,
    Animated,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Dimensions
} from 'react-native';
import {
    Text,
    IconButton,
    TextInput,
    Button,
    ActivityIndicator,
    Surface,
    Searchbar,
    Chip,
    FAB
} from 'react-native-paper';
import client from '../api/client';

const { width } = Dimensions.get('window');

const CategoryManagement = ({ visible, onClose, isAdmin }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // State cho thêm mới
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [addLoading, setAddLoading] = useState(false);

    // State cho sửa
    const [editingCategory, setEditingCategory] = useState(null);
    const [editName, setEditName] = useState('');
    const [editLoading, setEditLoading] = useState(false);

    // Animation
    const fadeAnim = useState(new Animated.Value(0))[0];

    // Fetch categories - wrapped in useCallback
    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const response = await client.get('/admin/category');
            if (response.data && response.data.data) {
                setCategories(response.data.data);
            }
        } catch (error) {
            console.log('Fetch categories error:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách danh mục');
        } finally {
            setLoading(false);
        }
    }, []);

    // Effect to fetch data when modal opens
    useEffect(() => {
        if (visible) {
            fetchCategories();
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true
            }).start();
        } else {
            fadeAnim.setValue(0);
            setShowAddForm(false);
            setSearchQuery('');
            setEditingCategory(null);
            setCategories([]); // Reset categories when modal closes
        }
    }, [visible, fetchCategories]);

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            Alert.alert('Thông báo', 'Vui lòng nhập tên danh mục');
            return;
        }

        setAddLoading(true);
        try {
            await client.post('/admin/category', { name: newCategoryName.trim() });
            Alert.alert('Thành công', 'Đã thêm danh mục mới');
            setNewCategoryName('');
            setShowAddForm(false);
            fetchCategories();
        } catch (error) {
            const message = error.response?.data?.message || 'Không thể thêm danh mục';
            Alert.alert('Lỗi', message);
        } finally {
            setAddLoading(false);
        }
    };

    const handleUpdateCategory = async () => {
        if (!editName.trim()) {
            Alert.alert('Thông báo', 'Vui lòng nhập tên danh mục');
            return;
        }

        if (editName.trim() === editingCategory.name) {
            Alert.alert('Thông báo', 'Tên mới giống tên cũ');
            return;
        }

        setEditLoading(true);
        try {
            await client.put('/admin/category', {
                oldName: editingCategory.name,
                newName: editName.trim()
            });
            Alert.alert('Thành công', 'Đã cập nhật danh mục');
            setEditingCategory(null);
            setEditName('');
            fetchCategories();
        } catch (error) {
            const message = error.response?.data?.message || 'Không thể cập nhật danh mục';
            Alert.alert('Lỗi', message);
        } finally {
            setEditLoading(false);
        }
    };

    const handleDeleteCategory = (category) => {
        Alert.alert(
            'Xác nhận xóa',
            `Bạn có chắc muốn xóa danh mục "${category.name}"?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await client.delete('/admin/category', {
                                data: { name: category.name }
                            });
                            Alert.alert('Thành công', 'Đã xóa danh mục');
                            fetchCategories();
                        } catch (error) {
                            const message = error.response?.data?.message || 'Không thể xóa danh mục';
                            Alert.alert('Lỗi', message);
                        }
                    }
                }
            ]
        );
    };

    const startEdit = (category) => {
        setEditingCategory(category);
        setEditName(category.name);
    };

    const cancelEdit = () => {
        setEditingCategory(null);
        setEditName('');
    };

    // Filter categories by search
    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderCategoryItem = ({ item, index }) => {
        const isEditing = editingCategory?._id === item._id;

        return (
            <Animated.View
                style={[
                    styles.categoryCard,
                    {
                        opacity: fadeAnim,
                        transform: [{
                            translateY: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [20, 0]
                            })
                        }]
                    }
                ]}
            >
                <Surface style={styles.cardSurface} elevation={2}>
                    {isEditing ? (
                        // Edit mode
                        <View style={styles.editContainer}>
                            <TextInput
                                mode="outlined"
                                value={editName}
                                onChangeText={setEditName}
                                style={styles.editInput}
                                dense
                                outlineColor="#7C3AED"
                                activeOutlineColor="#7C3AED"
                                autoFocus
                            />
                            <View style={styles.editActions}>
                                <IconButton
                                    icon="check"
                                    mode="contained"
                                    containerColor="#10B981"
                                    iconColor="white"
                                    size={18}
                                    onPress={handleUpdateCategory}
                                    loading={editLoading}
                                    disabled={editLoading}
                                />
                                <IconButton
                                    icon="close"
                                    mode="contained"
                                    containerColor="#6B7280"
                                    iconColor="white"
                                    size={18}
                                    onPress={cancelEdit}
                                    disabled={editLoading}
                                />
                            </View>
                        </View>
                    ) : (
                        // View mode
                        <View style={styles.cardContent}>
                            <View style={styles.categoryInfo}>
                                <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(index) }]}>
                                    <Text style={styles.categoryIconText}>
                                        {item.name.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.categoryDetails}>
                                    <Text style={styles.categoryName}>{item.name}</Text>
                                    <Text style={styles.categoryId}>ID: {item._id?.slice(-6) || 'N/A'}</Text>
                                </View>
                            </View>
                            <View style={styles.cardActions}>
                                <TouchableOpacity
                                    style={[styles.actionBtn, styles.editBtn]}
                                    onPress={() => startEdit(item)}
                                >
                                    <IconButton icon="pencil" iconColor="#7C3AED" size={18} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionBtn, styles.deleteBtn]}
                                    onPress={() => handleDeleteCategory(item)}
                                >
                                    <IconButton icon="delete" iconColor="#EF4444" size={18} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </Surface>
            </Animated.View>
        );
    };

    const getCategoryColor = (index) => {
        const colors = ['#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#8B5CF6', '#06B6D4'];
        return colors[index % colors.length];
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <View style={styles.modalContainer}>
                        {/* Header với background color */}
                        <View style={styles.header}>
                            <View style={styles.headerContent}>
                                <View style={styles.headerLeft}>
                                    <IconButton
                                        icon="shape-outline"
                                        iconColor="white"
                                        size={28}
                                    />
                                    <View>
                                        <Text style={styles.headerTitle}>Quản lý Danh mục</Text>
                                        <Text style={styles.headerSubtitle}>
                                            {categories.length} danh mục
                                        </Text>
                                    </View>
                                </View>
                                <IconButton
                                    icon="close"
                                    iconColor="white"
                                    size={24}
                                    onPress={onClose}
                                    style={styles.closeBtn}
                                />
                            </View>

                            {/* Search bar trong header */}
                            <Searchbar
                                placeholder="Tìm kiếm danh mục..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                style={styles.searchBar}
                                inputStyle={styles.searchInput}
                                iconColor="#7C3AED"
                            />
                        </View>

                        {/* Form thêm mới */}
                        {showAddForm && (
                            <Surface style={styles.addFormContainer} elevation={3}>
                                <Text style={styles.addFormTitle}>✨ Thêm danh mục mới</Text>
                                <View style={styles.addFormContent}>
                                    <TextInput
                                        mode="outlined"
                                        placeholder="Nhập tên danh mục..."
                                        value={newCategoryName}
                                        onChangeText={setNewCategoryName}
                                        style={styles.addInput}
                                        outlineColor="#E5E7EB"
                                        activeOutlineColor="#7C3AED"
                                        left={<TextInput.Icon icon="tag" color="#7C3AED" />}
                                    />
                                    <View style={styles.addFormActions}>
                                        <Button
                                            mode="contained"
                                            onPress={handleAddCategory}
                                            loading={addLoading}
                                            disabled={addLoading}
                                            style={styles.addSubmitBtn}
                                            labelStyle={styles.addSubmitLabel}
                                        >
                                            Thêm
                                        </Button>
                                        <Button
                                            mode="outlined"
                                            onPress={() => {
                                                setShowAddForm(false);
                                                setNewCategoryName('');
                                            }}
                                            style={styles.cancelBtn}
                                        >
                                            Hủy
                                        </Button>
                                    </View>
                                </View>
                            </Surface>
                        )}

                        {/* Danh sách categories */}
                        <View style={styles.listContainer}>
                            {loading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color="#7C3AED" />
                                    <Text style={styles.loadingText}>Đang tải...</Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={filteredCategories}
                                    renderItem={renderCategoryItem}
                                    keyExtractor={item => item._id}
                                    contentContainerStyle={styles.listContent}
                                    showsVerticalScrollIndicator={false}
                                    ListEmptyComponent={
                                        <View style={styles.emptyContainer}>
                                            <IconButton
                                                icon="folder-outline"
                                                size={60}
                                                iconColor="#D1D5DB"
                                            />
                                            <Text style={styles.emptyText}>
                                                {searchQuery
                                                    ? 'Không tìm thấy danh mục'
                                                    : 'Chưa có danh mục nào'}
                                            </Text>
                                            {!searchQuery && (
                                                <Text style={styles.emptyHint}>
                                                    Nhấn nút + để thêm danh mục mới
                                                </Text>
                                            )}
                                        </View>
                                    }
                                />
                            )}
                        </View>

                        {/* FAB thêm mới */}
                        {!showAddForm && (
                            <FAB
                                icon="plus"
                                style={styles.fab}
                                onPress={() => setShowAddForm(true)}
                                color="white"
                            />
                        )}
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#F9FAFB',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '90%',
        overflow: 'hidden',
    },
    header: {
        paddingTop: 16,
        paddingBottom: 20,
        paddingHorizontal: 16,
        backgroundColor: '#7C3AED',
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    closeBtn: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
    },
    searchBar: {
        borderRadius: 12,
        backgroundColor: 'white',
        elevation: 0,
    },
    searchInput: {
        fontSize: 14,
    },
    addFormContainer: {
        margin: 16,
        marginBottom: 8,
        padding: 16,
        borderRadius: 16,
        backgroundColor: 'white',
    },
    addFormTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 12,
    },
    addFormContent: {
        gap: 12,
    },
    addInput: {
        backgroundColor: 'white',
    },
    addFormActions: {
        flexDirection: 'row',
        gap: 12,
    },
    addSubmitBtn: {
        flex: 1,
        backgroundColor: '#7C3AED',
        borderRadius: 8,
    },
    addSubmitLabel: {
        fontWeight: '600',
    },
    cancelBtn: {
        flex: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
    },
    listContainer: {
        flex: 1,
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#6B7280',
        fontSize: 14,
    },
    categoryCard: {
        marginBottom: 12,
    },
    cardSurface: {
        borderRadius: 12,
        backgroundColor: 'white',
        overflow: 'hidden',
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    categoryIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryIconText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    categoryDetails: {
        marginLeft: 12,
        flex: 1,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    categoryId: {
        fontSize: 11,
        color: '#9CA3AF',
        marginTop: 2,
    },
    cardActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionBtn: {
        borderRadius: 8,
        marginLeft: 4,
    },
    editBtn: {
        backgroundColor: '#F3E8FF',
    },
    deleteBtn: {
        backgroundColor: '#FEE2E2',
    },
    editContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        gap: 8,
    },
    editInput: {
        flex: 1,
        backgroundColor: 'white',
        height: 40,
    },
    editActions: {
        flexDirection: 'row',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 8,
    },
    emptyHint: {
        fontSize: 13,
        color: '#9CA3AF',
        marginTop: 4,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 30,
        backgroundColor: '#7C3AED',
        borderRadius: 16,
    },
});

export default CategoryManagement;
