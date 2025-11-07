import { useLocation } from 'react-router-dom';
import NotesButton from './NotesButton';

const NotesWrapper = () => {
  const location = useLocation();

  // Don't show notes button on these pages
  const excludedPaths = [
    '/profile', 
    '/settings', 
    '/login', 
    '/signup', 
    '/',
    '/discussion-groups'  // ← ADD THIS LINE
  ];

  // Check if current path should exclude notes button
  const shouldShowNotes = !excludedPaths.some(path => 
    location.pathname === path || 
    location.pathname.startsWith('/profile/') ||
    location.pathname.startsWith('/discussion-groups/')  // ← ADD THIS LINE
  );

  if (!shouldShowNotes) {
    return null;
  }

  return <NotesButton />;
};

export default NotesWrapper;