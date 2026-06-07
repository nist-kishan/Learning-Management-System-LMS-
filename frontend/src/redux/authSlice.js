import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('token');
const userStr = localStorage.getItem('user');
let user = null;

if (userStr) {
  try {
    user = JSON.parse(userStr);
  } catch (e) {
    localStorage.removeItem('user');
  }
}

const initialState = {
  user: user,
  token: token,
  isAuthenticated: !!token,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      const { token, id, name, email, role } = action.payload;
      state.loading = false;
      state.isAuthenticated = true;
      state.token = token;
      state.user = { id, name, email, role };
      state.error = null;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    }
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateProfile } = authSlice.actions;
export default authSlice.reducer;
