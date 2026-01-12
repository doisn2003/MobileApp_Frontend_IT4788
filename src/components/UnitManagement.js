import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Modal,
    StyleSheet,
    FlatList,
    Alert,
    TouchableOpacity,
    Animated,
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
    FAB
} from 'react-native-paper';
import client from '../api/client';

const { width } = Dimensions.get('window');

const UnitManagement = ({ visible, onClose, isAdmin }) => {
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // State cho thêm mới
    const [showAddForm, setShowAddForm] = useState(false);
    const [newUnitName, setNewUnitName] = useState('');
    const [addLoading, setAddLoading] = useState(false);

    // State cho sửa
    const [editingUnit, setEditingUnit] = useState(null);
    const [editName, setEditName] = useState('');
    const [editLoading, setEditLoading] = useState(false);

    // Animation
    const fadeAnim = useState(new Animated.Value(0))[0];

    // Fetch units - wrapped in useCallback
    const fetchUnits = useCallback(async () => {
        setLoading(true);
        try {
            const response = await client.get('/admin/unit');
            if (response.data && response.data.data) {
                setUnits(response.data.data);
            }
        } catch (error) {
            console.log('Fetch units error:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách đơn vị');
        } finally {
            setLoading(false);
        }
    }, []);

    // Effect to fetch data when modal opens
    useEffect(() => {
        if (visible) {
            fetchUnits();
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true
            }).start();
        } else {
            fadeAnim.setValue(0);
            setShowAddForm(false);
            setSearchQuery('');
            setEditingUnit(null);
            setUnits([]); // Reset units when modal closes
        }
    }, [visible, fetchUnits]);

    const handleAddUnit = async () => {
        if (!newUnitName.trim()) {
            Alert.alert('Thông báo', 'Vui lòng nhập tên đơn vị');
            return;
        }

        setAddLoading(true);
        try {
            // API yêu cầu field là 'unitName' thay vì 'name'
            await client.post('/admin/unit', { unitName: newUnitName.trim() });
            Alert.alert('Thành công', 'Đã thêm đơn vị mới');
            setNewUnitName('');
            setShowAddForm(false);
            fetchUnits();
        } catch (error) {
            const message = error.response?.data?.message || 'Không thể thêm đơn vị';
            Alert.alert('Lỗi', message);
        } finally {
            setAddLoading(false);
        }
    };

    const handleUpdateUnit = async () => {
        if (!editName.trim()) {
            Alert.alert('Thông báo', 'Vui lòng nhập tên đơn vị');
            return;
        }

        if (editName.trim() === editingUnit.name) {
            Alert.alert('Thông báo', 'Tên mới giống tên cũ');
            return;
        }

        setEditLoading(true);
        try {
            await client.put('/admin/unit', {
                oldName: editingUnit.name,
                newName: editName.trim()
            });
            Alert.alert('Thành công', 'Đã cập nhật đơn vị');
            setEditingUnit(null);
            setEditName('');
            fetchUnits();
        } catch (error) {
            const message = error.response?.data?.message || 'Không thể cập nhật đơn vị';
            Alert.alert('Lỗi', message);
        } finally {
            setEditLoading(false);
        }
    };

    const handleDeleteUnit = (unit) => {
        Alert.alert(
            'Xác nhận xóa',
            `Bạn có chắc muốn xóa đơn vị "${unit.name}"?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // API yêu cầu field là 'unitName' thay vì 'name'
                            await client.delete('/admin/unit', {
                                data: { unitName: unit.name }
                            });
                            Alert.alert('Thành công', 'Đã xóa đơn vị');
                            fetchUnits();
                        } catch (error) {
                            const message = error.response?.data?.message || 'Không thể xóa đơn vị';
                            Alert.alert('Lỗi', message);
                        }
                    }
                }
            ]
        );
    };

    const startEdit = (unit) => {
        setEditingUnit(unit);
        setEditName(unit.name);
    };

    const cancelEdit = () => {
        setEditingUnit(null);
        setEditName('');
    };

    // Filter units by search
    const filteredUnits = units.filter(unit =>
        unit.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Icon mapping cho các đơn vị phổ biến
    const getUnitIcon = (unitName) => {
        const lowerName = unitName.toLowerCase();
        if (lowerName.includes('kg') || lowerName.includes('gram') || lowerName.includes('g')) return '⚖️';
        if (lowerName.includes('lít') || lowerName.includes('ml') || lowerName.includes('l')) return '🧴';
        if (lowerName.includes('hộp') || lowerName.includes('box')) return '📦';
        if (lowerName.includes('chai') || lowerName.includes('bottle')) return '🍶';
        if (lowerName.includes('gói') || lowerName.includes('pack')) return '🛍️';
        if (lowerName.includes('lon') || lowerName.includes('can')) return '🥫';
        if (lowerName.includes('quả') || lowerName.includes('trái')) return '🍎';
        if (lowerName.includes('con') || lowerName.includes('piece')) return '🔢';
        return '📏';
    };

    const renderUnitItem = ({ item, index }) => {
        const isEditing = editingUnit?._id === item._id;

        return (
            <Animated.View
                style={[
                    styles.unitCard,
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
                                outlineColor="#10B981"
                                activeOutlineColor="#10B981"
                                autoFocus
                            />
                            <View style={styles.editActions}>
                                <IconButton
                                    icon="check"
                                    mode="contained"
                                    containerColor="#10B981"
                                    iconColor="white"
                                    size={18}
                                    onPress={handleUpdateUnit}
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
                            <View style={styles.unitInfo}>
                                <View style={[styles.unitIcon, { backgroundColor: getUnitColor(index) }]}>
                                    <Text style={styles.unitIconText}>
                                        {getUnitIcon(item.name)}
                                    </Text>
                                </View>
                                <View style={styles.unitDetails}>
                                    <Text style={styles.unitName}>{item.name}</Text>
                                    <Text style={styles.unitId}>ID: {item._id?.slice(-6) || 'N/A'}</Text>
                                </View>
                            </View>
                            <View style={styles.cardActions}>
                                <TouchableOpacity
                                    style={[styles.actionBtn, styles.editBtn]}
                                    onPress={() => startEdit(item)}
                                >
                                    <IconButton icon="pencil" iconColor="#10B981" size={18} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionBtn, styles.deleteBtn]}
                                    onPress={() => handleDeleteUnit(item)}
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

    const getUnitColor = (index) => {
        const colors = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#EC4899', '#7C3AED'];
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
                                        icon="scale"
                                        iconColor="white"
                                        size={28}
                                    />
                                    <View>
                                        <Text style={styles.headerTitle}>Quản lý Đơn vị</Text>
                                        <Text style={styles.headerSubtitle}>
                                            {units.length} đơn vị
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
                                placeholder="Tìm kiếm đơn vị..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                style={styles.searchBar}
                                inputStyle={styles.searchInput}
                                iconColor="#10B981"
                            />
                        </View>

                        {/* Form thêm mới */}
                        {showAddForm && (
                            <Surface style={styles.addFormContainer} elevation={3}>
                                <Text style={styles.addFormTitle}>📏 Thêm đơn vị mới</Text>
                                <View style={styles.addFormContent}>
                                    <TextInput
                                        mode="outlined"
                                        placeholder="Nhập tên đơn vị (vd: kg, lít, hộp)..."
                                        value={newUnitName}
                                        onChangeText={setNewUnitName}
                                        style={styles.addInput}
                                        outlineColor="#E5E7EB"
                                        activeOutlineColor="#10B981"
                                        left={<TextInput.Icon icon="scale" color="#10B981" />}
                                    />
                                    <View style={styles.addFormActions}>
                                        <Button
                                            mode="contained"
                                            onPress={handleAddUnit}
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
                                                setNewUnitName('');
                                            }}
                                            style={styles.cancelBtn}
                                        >
                                            Hủy
                                        </Button>
                                    </View>
                                </View>
                            </Surface>
                        )}

                        {/* Danh sách units */}
                        <View style={styles.listContainer}>
                            {loading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color="#10B981" />
                                    <Text style={styles.loadingText}>Đang tải...</Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={filteredUnits}
                                    renderItem={renderUnitItem}
                                    keyExtractor={item => item._id}
                                    contentContainerStyle={styles.listContent}
                                    showsVerticalScrollIndicator={false}
                                    ListEmptyComponent={
                                        <View style={styles.emptyContainer}>
                                            <IconButton
                                                icon="scale-off"
                                                size={60}
                                                iconColor="#D1D5DB"
                                            />
                                            <Text style={styles.emptyText}>
                                                {searchQuery
                                                    ? 'Không tìm thấy đơn vị'
                                                    : 'Chưa có đơn vị nào'}
                                            </Text>
                                            {!searchQuery && (
                                                <Text style={styles.emptyHint}>
                                                    Nhấn nút + để thêm đơn vị mới
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
        backgroundColor: '#10B981',
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
    quickChips: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 4,
    },
    quickChipsLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 8,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    chipText: {
        color: '#059669',
        fontSize: 12,
        fontWeight: '500',
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
        backgroundColor: '#10B981',
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
    unitCard: {
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
    unitInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    unitIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    unitIconText: {
        fontSize: 20,
    },
    unitDetails: {
        marginLeft: 12,
        flex: 1,
    },
    unitName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    unitId: {
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
        backgroundColor: '#D1FAE5',
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
        backgroundColor: '#10B981',
        borderRadius: 16,
    },
});

export default UnitManagement;