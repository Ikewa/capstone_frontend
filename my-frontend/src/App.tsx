import { Routes, Route } from "react-router-dom"
import Booking from "./pages/Booking"
import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import NotFound from "./pages/NotFound"
import Home from "./pages/Home"
import Forum from './pages/Forum'
import AskQuestionPage from './pages/AskQuestionPage'
import QuestionDetailPage from './pages/QuestionDetailPage'
import EventsPage from './pages/EventsPage'  
import EventDetailPage from './pages/EventDetailPage'
import CropRecommendationRequestPage from "./pages/CropRecommendationRequestPage"
import MyCropRequestsPage from "./pages/MyCropRequestsPage"
import RequestDetailPage from "./pages/RequestDetailPage"
import OfficerCropRequestsPage from "./pages/OfficerCropRequestsPage"  // ← NEW IMPORT
import { ToastProvider } from './context/ToastContext'
import CropCatalogPage from './pages/CropCatalogPage'
import BookingRequestPage from './pages/BookingRequestPage'
import MyBookingsPage from './pages/MyBookingsPage'
import ManageBookingsPage from './pages/ManageBookingsPage'
import MapPage from './pages/MapPage'
import CreateEventPage from './pages/CreateEventPage'
import MyEventsPage from './pages/MyEventsPage'
import ProfilePage from "./pages/ProfilePage"
import SettingsPage from './pages/SettingsPage'
import ChatsPage from './pages/ChatsPage'
import ChatPage from './pages/ChatPage'
import { SocketProvider } from './context/SocketContext'
import DiscussionGroupsPage from './pages/DiscussionGroupsPage'
import GroupDiscussionPage from './pages/GroupDiscussionPage'
import NotesWrapper from './components/NotesWrapper'
import { LanguageProvider } from "./context/LanguageContext"
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import CreateAdmin from './pages/admin/CreateAdmin'
import AdminUsers from './pages/admin/AdminUsers'
import AdminQuestions from './pages/admin/AdminQuestions'
import AdminGroups from './pages/admin/AdminGroups'
import AdminEvents from './pages/admin/AdminEvents'
import AdminReports from './pages/admin/AdminReports'
import AdminSettings from './pages/admin/AdminSettings'
import AdminCropCatalog from './pages/admin/AdminCropCatalog'
import CropCatalog from './pages/CropCatalog'
import CropDetail from './pages/CropDetail'
import CropComparison from './pages/CropComparison'
import PlantingCalendar from './pages/PlantingCalendar'
import GrowingGuide from './pages/GrowingGuide'



function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <SocketProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<Home />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Signup" element={<Signup />} />
            
            {/* Forum */}
            <Route path="/questions" element={<Forum />} />
            <Route path="/questions/:id" element={<QuestionDetailPage />} />
            <Route path="/ask-question" element={<AskQuestionPage />} />

            {/* Forum - NOW DISCUSSION GROUPS */}
            <Route path="/forum" element={<DiscussionGroupsPage />} />
            <Route path="/discussion-groups" element={<DiscussionGroupsPage />} />
            <Route path="/discussion-groups/:id" element={<GroupDiscussionPage />} />
            
            {/* Events */}
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/my-events" element={<MyEventsPage />} />
            <Route path="/create-event" element={<CreateEventPage />} />
            
            {/* Crops - Farmers */}
            <Route path="/crop-catalog" element={<CropCatalogPage />} />
            <Route path="/crop-recommendations" element={<CropRecommendationRequestPage />} />
            <Route path="/my-crop-requests" element={<MyCropRequestsPage />} />
            <Route path="/crop-requests/:id" element={<RequestDetailPage />} />
            <Route path="/crop-catalog/:id" element={<CropDetail />} />
            <Route path="/crop-comparison" element={<CropComparison />} />
            <Route path="/planting-calendar" element={<PlantingCalendar />} />
            <Route path="/crop-catalog/:id/growing-guide" element={<GrowingGuide />} />

            {/* Crops - Officers */}
            <Route path="/officer/crop-requests" element={<OfficerCropRequestsPage />} />  {/* ← NEW ROUTE */}

            {/* Bookings */}
            <Route path="/book-consultation" element={<BookingRequestPage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/manage-bookings" element={<ManageBookingsPage />} />
            
            {/* Profile & Settings */}
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/chats" element={<ChatsPage />} />
            <Route path="/chat/:conversation_id" element={<ChatPage />} />
            
            {/* Other */}
            <Route path="/map" element={<MapPage />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/crop-catalog" element={<CropCatalog />} />

            {/* ==================== ADMIN ROUTES ==================== */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/create-admin" element={<CreateAdmin />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/questions" element={<AdminQuestions />} />
            <Route path="/admin/groups" element={<AdminGroups />} />
            <Route path="/admin/events" element={<AdminEvents />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/crop-catalog" element={<AdminCropCatalog />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <NotesWrapper />
        </SocketProvider>
      </ToastProvider>
    </LanguageProvider>
  )
}

export default App