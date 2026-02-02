/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Dashboard from './pages/Dashboard.jsx';
import Properties from './pages/Properties.jsx';
import Tenants from './pages/Tenants.jsx';
import Payments from './pages/Payments.jsx';
import Maintenance from './pages/Maintenance.jsx';
import Assistant from './pages/Assistant.jsx';
import Documents from './pages/Documents.jsx';
import TenantPortal from './pages/TenantPortal.jsx';
import Announcements from './pages/Announcements.jsx';
import Messages from './pages/Messages.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import UserManagement from './pages/UserManagement.jsx';
import LandingPage from './pages/LandingPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import __Layout from './Layout.jsx';

export const PAGES = {
  "LandingPage": LandingPage,
  "Dashboard": Dashboard,
  "AdminDashboard": AdminDashboard,
  "Properties": Properties,
  "Tenants": Tenants,
  "Payments": Payments,
  "Maintenance": Maintenance,
  "Assistant": Assistant,
  "Documents": Documents,
  "TenantPortal": TenantPortal,
  "Announcements": Announcements,
  "Messages": Messages,
  "UserDashboard": UserDashboard,
  "UserManagement": UserManagement,
};

export const pagesConfig = {
  mainPage: "LandingPage",
  Pages: PAGES,
  Layout: __Layout,
};