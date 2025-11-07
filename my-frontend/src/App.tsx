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
// import { Language } from "@mui/icons-material"
import { LanguageProvider } from "./context/LanguageContext"

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
            
            {/* Crops */}
            <Route path="/crop-catalog" element={<CropCatalogPage />} />
            <Route path="/crop-recommendations" element={<CropRecommendationRequestPage />} />
            <Route path="/my-crop-requests" element={<MyCropRequestsPage />} />
            <Route path="/crop-requests/:id" element={<RequestDetailPage />} />
            
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
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <NotesWrapper />
        </SocketProvider>
      </ToastProvider>
    </LanguageProvider>
  )
}

export default App