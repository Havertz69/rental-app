import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Users, Shield, ArrowRight, 
  Home, CreditCard, Wrench, Bell,
  CheckCircle, Lock, Mail, Phone
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('');

  const handleRoleSelect = (role) => {
    console.log('Role selected:', role);
    setSelectedRole(role);
    try {
      // Navigate to login with role parameter
      navigate(`/login?role=${role}`);
      console.log('Navigated to login with role:', role);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const features = [
    {
      icon: Building2,
      title: 'Property Management',
      description: 'Manage properties, tenants, payments, and maintenance requests'
    },
    {
      icon: Users,
      title: 'Tenant Portal',
      description: 'View your room details, pay rent, submit maintenance requests'
    },
    {
      icon: CreditCard,
      title: 'Smart Payments',
      description: 'AI-powered payment predictions and automated reminders'
    },
    {
      icon: Wrench,
      title: 'Maintenance Tracking',
      description: 'Smart categorization and priority-based issue resolution'
    },
    {
      icon: Bell,
      title: 'Real-time Notifications',
      description: 'Instant alerts for important updates and deadlines'
    },
    {
      icon: Shield,
      title: 'AI-Powered Insights',
      description: 'Predictive analytics and smart recommendations'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">RentWise</h1>
                <p className="text-sm text-gray-500">Smart Property Management</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
              Welcome to
              <span className="block text-blue-600">RentWise</span>
            </h2>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              AI-powered property management system that makes rental management smarter, 
              faster, and more efficient for both landlords and tenants.
            </p>
          </motion.div>

          {/* Role Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          >
            {/* Admin/Landlord Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelect('admin')}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 cursor-pointer hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
                  Admin Portal
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                I'm a Property Manager
              </h3>
              <p className="text-gray-600 mb-6">
                Manage properties, tenants, payments, and access AI-powered insights 
                for optimal property management.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Complete property management</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>AI-powered analytics</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Tenant management tools</span>
                </div>
              </div>
              <button className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>

            {/* Tenant Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelect('tenant')}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 cursor-pointer hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                  User Portal
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                I'm a User
              </h3>
              <p className="text-gray-600 mb-6">
                Access your room details, pay rent online, submit maintenance requests, 
                and get personalized AI assistance.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Home className="w-4 h-4 text-purple-500" />
                  <span>View room details</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard className="w-4 h-4 text-purple-500" />
                  <span>Online payments</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Wrench className="w-4 h-4 text-purple-500" />
                  <span>Maintenance requests</span>
                </div>
              </div>
              <button className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Access Portal
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose RentWise?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of property management with our AI-powered platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of property managers and tenants who trust RentWise
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handleRoleSelect('admin')}
                className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Start as Property Manager
              </button>
              <button
                onClick={() => handleRoleSelect('tenant')}
                className="px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Access User Portal
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building2 className="w-6 h-6" />
            <span className="text-xl font-bold">RentWise</span>
          </div>
          <p className="text-gray-400">
            © 2024 RentWise. Smart Property Management System.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
