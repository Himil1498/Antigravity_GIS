
import { createAsyncThunk } from '@reduxjs/toolkit';
import type { User } from '../../../types/auth/index';

// Async Thunks for API calls (will use mock data in development)
export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (_, { getState }) => {
    // This will be replaced with actual API call
    // For now, return mock data
    const mockUsers: User[] = [
      {
        id: 'USER001',
        username: 'admin_raj',
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@jio.com',
        password: '********',
        gender: 'Male',
        phoneNumber: '+91-9876543210',
        address: {
          street: '123 Tech Park',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001'
        },
        officeLocation: 'Mumbai HQ',
        assignedUnder: [],
        role: 'admin',
        assignedRegions: ['Maharashtra', 'Gujarat'],
        groups: [],
        status: 'Active',
        loginHistory: [
          { timestamp: new Date('2024-01-15T10:30:00'), location: 'Mumbai, India' }
        ],
        company: 'Jio',
        permissions: ['all'],
      },
      {
        id: 'USER002',
        username: 'manager_priya',
        name: 'Priya Sharma',
        email: 'priya.sharma@airtel.com',
        password: '********',
        gender: 'Female',
        phoneNumber: '+91-9876543211',
        address: {
          street: '456 Business District',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001'
        },
        officeLocation: 'Delhi Regional Office',
        assignedUnder: ['USER001'],
        role: 'manager',
        assignedRegions: ['Delhi', 'Punjab', 'Haryana'],
        groups: [],
        status: 'Active',
        loginHistory: [
          { timestamp: new Date('2024-01-15T09:45:00'), location: 'Delhi, India' }
        ],
        company: 'Airtel',
        permissions: ['read', 'write', 'manage_team'],
      },
      {
        id: 'USER003',
        username: 'tech_amit',
        name: 'Amit Singh',
        email: 'amit.singh@vi.com',
        password: '********',
        gender: 'Male',
        phoneNumber: '+91-9876543212',
        address: {
          street: '789 Industrial Area',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001'
        },
        officeLocation: 'Bangalore Tech Center',
        assignedUnder: ['USER002'],
        role: 'technician',
        assignedRegions: ['Karnataka', 'Tamil Nadu'],
        groups: [],
        status: 'Active',
        loginHistory: [
          { timestamp: new Date('2024-01-15T08:30:00'), location: 'Bangalore, India' }
        ],
        company: 'Vi',
        permissions: ['read', 'write'],
      },
    ];

    return mockUsers;
  }
);

export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData: Omit<User, 'id' | 'loginHistory'>) => {
    // Generate new ID
    const newId = `USER${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

    const newUser: User = {
      ...userData,
      id: newId,
      loginHistory: [],
    };

    // In production, this would be an API call
    return newUser;
  }
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ id, updates }: { id: string; updates: Partial<User> }) => {
    // In production, this would be an API call
    return { id, updates };
  }
);

export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (userId: string) => {
    // In production, this would be an API call
    return userId;
  }
);

export const bulkUpdateUsers = createAsyncThunk(
  'user/bulkUpdateUsers',
  async ({ userIds, updates }: { userIds: string[]; updates: Partial<User> }) => {
    // In production, this would be an API call
    return { userIds, updates };
  }
);

export const bulkDeleteUsers = createAsyncThunk(
  'user/bulkDeleteUsers',
  async (userIds: string[]) => {
    // In production, this would be an API call
    return userIds;
  }
);

