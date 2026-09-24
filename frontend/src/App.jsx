import { useEffect, useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Display from "./components/Display.jsx";
import SuperAdminDashboard from "./components/SuperAdminDashboard.jsx";

import {
  auth,
  db,
  googleProvider,
} from "./firebase.js";


function AppContent() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);


  // ==========================================
  // GET USER DOCUMENT FROM FIRESTORE
  // ==========================================

  async function getUserDocument(uid) {
    const userRef = doc(db, "users", uid);

    for (let attempt = 0; attempt < 5; attempt++) {
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        return snapshot;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 300)
      );
    }

    return null;
  }


  // ==========================================
  // CHECK FIREBASE AUTH STATE
  // ==========================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {

        if (!currentUser) {
          setUser(null);
          setRole(null);
          setLoading(false);
          return;
        }

        try {

          const userRef = doc(
            db,
            "users",
            currentUser.uid
          );

          let userSnap = await getUserDocument(
            currentUser.uid
          );


          // ======================================
          // GOOGLE USER
          // ======================================

          const isGoogleUser =
            currentUser.providerData.some(
              (provider) =>
                provider.providerId === "google.com"
            );


          // ======================================
          // CREATE FIRESTORE DOCUMENT FOR
          // NEW GOOGLE USER
          // ======================================

          if (!userSnap && isGoogleUser) {

            await setDoc(userRef, {
              uid: currentUser.uid,

              name:
                currentUser.displayName || "",

              email:
                currentUser.email || "",

              role: "admin",

              createdAt:
                serverTimestamp(),
            });

            userSnap = await getDoc(userRef);
          }


          // ======================================
          // USER DOCUMENT DOES NOT EXIST
          // ======================================

          if (!userSnap) {

            console.error(
              "User document does not exist."
            );

            await signOut(auth);

            setUser(null);
            setRole(null);
            setLoading(false);

            return;
          }


          // ======================================
          // GET ROLE
          // ======================================

          const userData = userSnap.data();

          const userRole = userData.role;


          console.log(
            "Logged-in user:",
            currentUser.email
          );

          console.log(
            "Firestore role:",
            userRole
          );


          // ======================================
          // VALIDATE ROLE
          // ======================================

          if (
            userRole !== "admin" &&
            userRole !== "superadmin"
          ) {

            console.error(
              "Invalid role:",
              userRole
            );

            await signOut(auth);

            setUser(null);
            setRole(null);
            setLoading(false);

            return;
          }


          // ======================================
          // SET USER AND ROLE
          // ======================================

          setUser(currentUser);
          setRole(userRole);

        } catch (error) {

          console.error(
            "Error loading user:",
            error
          );

          await signOut(auth);

          setUser(null);
          setRole(null);

        } finally {

          setLoading(false);
        }
      }
    );


    return unsubscribe;
  }, []);


  // ==========================================
  // EMAIL LOGIN
  // ==========================================

  async function handleLogin(
    email,
    password
  ) {

    await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

  }


  // ==========================================
  // GOOGLE LOGIN
  // ==========================================

  async function handleGoogleLogin() {

    await signInWithPopup(
      auth,
      googleProvider
    );

  }


  // ==========================================
  // SIGN UP
  // ==========================================

  async function handleSignup({
    name,
    email,
    password,
  }) {

    const credential =
      await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );


    const newUser = credential.user;


    // ========================================
    // UPDATE FIREBASE PROFILE
    // ========================================

    await updateProfile(
      newUser,
      {
        displayName: name.trim(),
      }
    );


    // ========================================
    // CREATE FIRESTORE USER DOCUMENT
    // ========================================

    await setDoc(
      doc(
        db,
        "users",
        newUser.uid
      ),
      {
        uid: newUser.uid,

        name: name.trim(),

        email:
          newUser.email ||
          email.trim(),

        role: "admin",

        createdAt:
          serverTimestamp(),
      }
    );


    setUser(newUser);
    setRole("admin");
  }


  // ==========================================
  // LOGOUT
  // ==========================================

  async function handleLogout() {

    try {

      await signOut(auth);

      setUser(null);
      setRole(null);

      navigate("/login");

    } catch (error) {

      console.error(
        "Logout error:",
        error
      );
    }
  }


  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading) {

    return (
      <div
        className="loading-screen"
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >

        <div
          className="spinner-border text-dark"
          role="status"
        />

      </div>
    );
  }


  // ==========================================
  // ROUTES
  // ==========================================

  return (
    <Routes>

      {/* =====================================
          LOGIN
      ====================================== */}

      <Route
        path="/login"
        element={
          !user ? (
            <Login
              onLogin={handleLogin}
              onGoogleLogin={handleGoogleLogin}
              onSignup={() =>
                navigate("/signup")
              }
            />
          ) : role === "superadmin" ? (
            <Navigate
              to="/superadmin"
              replace
            />
          ) : role === "admin" ? (
            <Navigate
              to="/admin"
              replace
            />
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />


      {/* =====================================
          SIGNUP
      ====================================== */}

      <Route
        path="/signup"
        element={
          !user ? (
            <Signup
              onSignup={handleSignup}
              onBackToLogin={() =>
                navigate("/login")
              }
            />
          ) : role === "superadmin" ? (
            <Navigate
              to="/superadmin"
              replace
            />
          ) : (
            <Navigate
              to="/admin"
              replace
            />
          )
        }
      />


      {/* =====================================
          ADMIN
      ====================================== */}

      <Route
        path="/admin"
        element={
          user && role === "admin" ? (
            <Display
              user={user}
              role={role}
              onLogout={handleLogout}
            />
          ) : user && role === "superadmin" ? (
            <Navigate
              to="/superadmin"
              replace
            />
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />


      {/* =====================================
          SUPER ADMIN
      ====================================== */}

      <Route
        path="/superadmin"
        element={
          user && role === "superadmin" ? (
            <SuperAdminDashboard
              user={user}
              onLogout={handleLogout}
            />
          ) : user && role === "admin" ? (
            <Navigate
              to="/admin"
              replace
            />
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />


      {/* =====================================
          DEFAULT ROUTE
      ====================================== */}

      <Route
        path="/"
        element={
          <Navigate
            to={
              !user
                ? "/login"
                : role === "superadmin"
                ? "/superadmin"
                : "/admin"
            }
            replace
          />
        }
      />


      {/* =====================================
          UNKNOWN URL
      ====================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to={
              !user
                ? "/login"
                : role === "superadmin"
                ? "/superadmin"
                : "/admin"
            }
            replace
          />
        }
      />

    </Routes>
  );
}


// ==========================================
// MAIN APP
// ==========================================

export default function App() {

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}