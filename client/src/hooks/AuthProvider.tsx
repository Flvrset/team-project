import { createContext, useState, ReactNode, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserData {
    name: string;
    surname: string;
    email: string;
    login: string;
}

interface AuthContextType {
    userData: UserData | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (userData: UserData) => void;
    logout: () => void;
    checkAuthStatus: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType>({
    userData: null,
    isAuthenticated: false,
    loading: true,
    login: () => { },
    logout: () => { },
    checkAuthStatus: async () => false
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const checkAuthStatus = async (): Promise<boolean> => {
        if (userData) {
            return true;
        }
        
        try {
            const response = await fetch('/api/protected', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setUserData(data);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Authentication check failed:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const login = (userData: UserData) => {
        setUserData(userData);
    };

    const logout = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include', // Important for cookies
            });

            if (response.ok) {
                setUserData(null);
                navigate('/login');
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            userData,
            isAuthenticated: !!userData,
            loading,
            login,
            logout,
            checkAuthStatus
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;

export const useAuth = () => useContext(AuthContext);