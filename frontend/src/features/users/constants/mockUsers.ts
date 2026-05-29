import { User } from '../../../types/auth/index';

// Mock user data for fallback when API fails
export const MOCK_USERS: User[] = [
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
    ]
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
    ]
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
    ]
  }
];


