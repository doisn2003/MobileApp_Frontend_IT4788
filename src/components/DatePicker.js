import React, { useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { IconButton } from 'react-native-paper';
import dayjs from 'dayjs';

const DatePicker = ({ date, onDateChange, markedDates }) => {
    const [visible, setVisible] = useState(false);

    const onDayPress = (day) => {
        const selectedDate = dayjs(day.dateString);
        onDateChange(selectedDate);
        setVisible(false);
    };

    // Prepare marked dates: Add the selected date indicator + dots for existing meals
    const getMarkedDates = () => {
        const marks = {};

        // Add blue dots for dates with meals
        if (markedDates && Array.isArray(markedDates)) {
            markedDates.forEach(d => {
                marks[d] = {
                    marked: true,
                    dotColor: '#25eb28ff' // Blue dot
                };
            });
        }

        // Add selected date highlighting (override or merge)
        const selectedStr = date.format('YYYY-MM-DD');
        marks[selectedStr] = {
            ...(marks[selectedStr] || {}), // Keep existing dot if any
            selected: true,
            selectedColor: '#7C3AED' // Primary purple for selection
        };

        return marks;
    };

    return (
        <>
            <TouchableOpacity onPress={() => setVisible(true)} style={styles.headerTrigger}>
                <IconButton icon="calendar" size={20} iconColor="#4B5563" style={{ margin: 0 }} />
                <Text style={styles.dateText}>{date.format('DD/MM/YYYY')}</Text>
                <IconButton icon="chevron-down" size={20} iconColor="#9CA3AF" style={{ margin: 0 }} />
            </TouchableOpacity>

            <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setVisible(false)}>
                    <View style={styles.calendarContainer} onStartShouldSetResponder={() => true}>
                        <Calendar
                            current={date.format('YYYY-MM-DD')}
                            onDayPress={onDayPress}
                            markedDates={getMarkedDates()}
                            theme={{
                                todayTextColor: '#7C3AED',
                                arrowColor: '#7C3AED',
                                selectedDayBackgroundColor: '#7C3AED',
                                dotColor: '#25eb25ff',
                            }}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    headerTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4
    },
    dateText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827'
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20
    },
    calendarContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        padding: 10
    }
});

export default DatePicker;
