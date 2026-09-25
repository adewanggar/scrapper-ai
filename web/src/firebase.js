import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC-mCSjAgmxEWd8SWY_3PRiDmh_lKGItz0",
  authDomain: "tesis-ori.firebaseapp.com",
  projectId: "tesis-ori",
  storageBucket: "tesis-ori.firebasestorage.app",
  messagingSenderId: "82797472070",
  appId: "1:82797472070:web:8760b99a937c04bfcb5d47",
  measurementId: "G-HXKDRN8FW6"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// ==========================================
// Authentication Helpers
// ==========================================

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: getAuthErrorMessage(error) };
  }
}

export async function loginWithEmail(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: getAuthErrorMessage(error) };
  }
}

export async function registerWithEmail(email, password, displayName = '') {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && result.user) {
      await updateProfile(result.user, { displayName });
    }
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: getAuthErrorMessage(error) };
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

function getAuthErrorMessage(error) {
  const code = error?.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'Format email tidak valid.';
    case 'auth/user-disabled':
      return 'Akun ini telah dinonaktifkan.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email atau kata sandi salah. Silakan periksa kembali.';
    case 'auth/email-already-in-use':
      return 'Email sudah terdaftar. Silakan login atau gunakan email lain.';
    case 'auth/weak-password':
      return 'Kata sandi terlalu lemah. Gunakan minimal 6 karakter.';
    case 'auth/popup-closed-by-user':
      return 'Jendela login Google ditutup sebelum selesai.';
    case 'auth/cancelled-popup-request':
      return 'Permintaan login dibatalkan.';
    case 'auth/network-request-failed':
      return 'Gagal terhubung ke server Firebase. Periksa koneksi internet Anda.';
    default:
      return error?.message || 'Terjadi kesalahan saat autentikasi.';
  }
}

// ==========================================
// Firestore Private Per-User Data Helpers
// ==========================================

function getDocIdFromFilename(filename) {
  // Firestore doc IDs shouldn't have '/'
  return encodeURIComponent(filename || `scrape_${Date.now()}`);
}

/**
 * Save scraping result privately under users/{userId}/scrapes/{docId}
 * Supports:
 * - saveUserScrape(userId, filename, scrapeData)
 * - saveUserScrape(userId, scrapeData)
 */
export async function saveUserScrape(userId, filenameOrData, optionalData) {
  if (!userId) throw new Error('User ID wajib untuk menyimpan data private.');

  let filename = '';
  let scrapeData = {};

  if (typeof filenameOrData === 'string') {
    filename = filenameOrData;
    scrapeData = optionalData || {};
  } else if (filenameOrData && typeof filenameOrData === 'object') {
    scrapeData = filenameOrData;
    filename = scrapeData.filename || (typeof optionalData === 'string' ? optionalData : '');
  }

  if (!filename) {
    filename = scrapeData.filename || `scrape_${Date.now()}.json`;
  }

  const docId = getDocIdFromFilename(filename);
  const docRef = doc(db, 'users', userId, 'scrapes', docId);

  // Extract and sanitize comments to prevent Firestore crashing on `undefined` values
  const rawComments = Array.isArray(scrapeData.comments) ? scrapeData.comments : [];
  const sanitizedComments = rawComments.map((c, idx) => {
    const rawReplies = Array.isArray(c.replies) ? c.replies : [];
    return {
      comment_id: String(c.comment_id || c.cid || `c_${idx + 1}`),
      username: String(c.username || c.user || 'anonymous'),
      nickname: String(c.nickname || c.username || 'User'),
      comment: String(c.comment || c.text || ''),
      create_time: String(c.create_time || ''),
      avatar: String(c.avatar || ''),
      like_count: Number(c.like_count || 0),
      total_reply: Number(c.total_reply ?? rawReplies.length),
      replies: rawReplies.map((r, rIdx) => ({
        comment_id: String(r.comment_id || r.cid || `r_${idx}_${rIdx + 1}`),
        username: String(r.username || r.user || 'anonymous'),
        nickname: String(r.nickname || r.username || 'User'),
        comment: String(r.comment || r.text || ''),
        create_time: String(r.create_time || ''),
        avatar: String(r.avatar || ''),
        like_count: Number(r.like_count || 0),
        total_reply: 0,
        replies: []
      }))
    };
  });

  const payload = {
    filename,
    userId,
    caption: String(scrapeData.caption || ''),
    video_url: String(scrapeData.video_url || ''),
    comments_count: sanitizedComments.length || Number(scrapeData.comments_count || 0),
    comments: sanitizedComments,
    platform: String(scrapeData.platform || (filename.startsWith('yt_') ? 'youtube' : 'tiktok')),
    modified: new Date().toISOString(),
    updatedAt: serverTimestamp(),
    createdAt: scrapeData.createdAt || new Date().toISOString()
  };

  await setDoc(docRef, payload, { merge: true });
  return { id: docId, ...payload };
}

/**
 * Fetch all private scrapes belonging to a specific user
 */
export async function getUserScrapes(userId) {
  if (!userId) return [];

  const scrapesCol = collection(db, 'users', userId, 'scrapes');
  try {
    const q = query(scrapesCol, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        filename: data.filename || d.id,
        caption: data.caption || '',
        video_url: data.video_url || '',
        comments_count: data.comments_count || (data.comments ? data.comments.length : 0),
        modified: data.modified || (data.updatedAt?.toDate?.()?.toISOString()) || new Date().toISOString(),
        comments: data.comments || []
      };
    });
  } catch (err) {
    // If orderBy index is still building or missing, fallback to unordered getDocs
    console.warn('Fallback getUserScrapes without orderBy:', err);
    const snapshot = await getDocs(scrapesCol);
    const list = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        filename: data.filename || d.id,
        caption: data.caption || '',
        video_url: data.video_url || '',
        comments_count: data.comments_count || (data.comments ? data.comments.length : 0),
        modified: data.modified || new Date().toISOString(),
        comments: data.comments || []
      };
    });
    // Sort in memory by modified descending
    return list.sort((a, b) => new Date(b.modified) - new Date(a.modified));
  }
}

/**
 * Get full private scrape document by filename or docId
 */
export async function getUserScrapeContent(userId, filename) {
  if (!userId || !filename) return null;
  const docId = getDocIdFromFilename(filename);
  const docRef = doc(db, 'users', userId, 'scrapes', docId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return snap.data();
}

/**
 * Delete a private scrape document
 */
export async function deleteUserScrape(userId, filename) {
  if (!userId || !filename) return false;
  const docId = getDocIdFromFilename(filename);
  const docRef = doc(db, 'users', userId, 'scrapes', docId);
  await deleteDoc(docRef);
  return true;
}

/**
 * Save cached AI analysis for a specific scrape
 */
export async function saveUserAiAnalysis(userId, filename, analysisType, analysis) {
  if (!userId || !filename || !analysis) return;
  const docId = getDocIdFromFilename(filename);
  const docRef = doc(db, 'users', userId, 'scrapes', docId);
  const cleanAnalysis = JSON.parse(JSON.stringify(analysis));
  await setDoc(
    docRef,
    {
      analyses: {
        [analysisType]: {
          result: cleanAnalysis,
          updatedAt: new Date().toISOString()
        }
      }
    },
    { merge: true }
  );
}

/**
 * Get cached AI analysis from the user's private scrape doc
 */
export async function getUserAiAnalysis(userId, filename, analysisType) {
  if (!userId || !filename) return null;
  const docId = getDocIdFromFilename(filename);
  const docRef = doc(db, 'users', userId, 'scrapes', docId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  const data = snap.data();
  return data?.analyses?.[analysisType]?.result || null;
}

export async function saveResearchContext(userId, filename, context) {
  if (!userId || !filename) return;
  const ref = doc(db, 'users', userId, 'scrapes', getDocIdFromFilename(filename));
  // Replace this field so clearing a selected title/theory does not retain nested values.
  await setDoc(ref, { researchContext: JSON.parse(JSON.stringify(context)) }, { mergeFields: ['researchContext'] });
}
