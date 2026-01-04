import { createNavigationContainerRef } from '@react-navigation/native';

/**
 * Reference để navigation từ bất kỳ đâu (không cần props)
 * Dùng trong notification handlers
 */
export const navigationRef = createNavigationContainerRef();

/**
 * Helper function để navigate
 */
export function navigate(name, params) {
    if (navigationRef.isReady()) {
        navigationRef.navigate(name, params);
    } else {
        console.warn('⚠️ Navigation not ready, queuing navigation...');
        // Retry sau 500ms
        setTimeout(() => {
            if (navigationRef.isReady()) {
                navigationRef.navigate(name, params);
            }
        }, 500);
    }
}

/**
 * Helper function để goBack
 */
export function goBack() {
    if (navigationRef.isReady() && navigationRef.canGoBack()) {
        navigationRef.goBack();
    }
}

/**
 * Helper function để reset navigation stack
 */
export function resetNavigation(routeName) {
    if (navigationRef.isReady()) {
        navigationRef.reset({
            index: 0,
            routes: [{ name: routeName }],
        });
    }
}