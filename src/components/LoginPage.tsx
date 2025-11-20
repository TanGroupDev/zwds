import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Toast from "./Toast";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [showPassword, setShowPassword] = useState(false);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (username.trim() === "TanGroup" && password.trim() === "Lauser@3a#") {
      // SIMPAN LOGIN STATUS
      localStorage.setItem("isLoggedIn", "true");

      showToast("Login success!", "success");

      // REDIRECT SETELAH TOAST
      setTimeout(() => {
        window.location.reload(); // reload supaya App.tsx baca login state
      }, 800);
    } else {
      showToast("Invalid username or password!", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700"
      >
        {/* ALERT DI DALAM CARD - POSISI DI ATAS JUDUL */}
        <AnimatePresence>
          {toast.show && <Toast message={toast.message} type={toast.type} />}
        </AnimatePresence>

        <h2 className="text-3xl font-bold text-center mb-6 text-white">
          Login ZWDS Chart
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl 
              focus:outline-none focus:ring-2 focus:ring-indigo-400 text-white"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <div className="relative">
              <label className="block mb-1 font-medium">Password</label>

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl 
    focus:outline-none focus:ring-2 focus:ring-indigo-400 text-white pr-12"
                placeholder="••••••••"
                required
              />

              {/* ICON MATA REACT-ICONS */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[52px] transform -translate-y-1/2"
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible
                    size={24}
                    style={{ color: "#3d3d3d" }}
                  />
                ) : (
                  <AiOutlineEye size={24} style={{ color: "#3d3d3d" }} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white 
            py-3 rounded-xl transition font-medium"
          >
            Login
          </button>
        </form>
      </motion.div>
    </div>
  );
}
