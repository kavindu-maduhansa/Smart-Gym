import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import apiClient from "../services/apiClient";

const Contact = () => {
  const navigate = useNavigate();
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });
  const isLoggedIn =
    typeof localStorage !== "undefined" && Boolean(localStorage.getItem("token"));

  const contactItems = [
    {
      id: 1,
      icon: FaPhoneAlt,
      title: "Phone",
      detail: "+94 71 234 5678",
      note: "Call us for quick support during working hours.",
    },
    {
      id: 2,
      icon: FaEnvelope,
      title: "Email",
      detail: "support@smartgym.lk",
      note: "Send us your inquiry and we will respond promptly.",
    },
    {
      id: 3,
      icon: FaMapMarkerAlt,
      title: "Location",
      detail: "Sri Lanka Institute of Information Technology, Malabe",
      note: "Visit our admin office for direct assistance.",
    },
  ];

  const hours = [
    { id: 1, day: "Monday - Friday", time: "8:00 AM - 8:00 PM" },
    { id: 2, day: "Saturday", time: "9:00 AM - 6:00 PM" },
    { id: 3, day: "Sunday", time: "9:00 AM - 1:00 PM" },
  ];

  const supportContacts = [
    {
      id: 1,
      team: "Membership Desk",
      email: "membership@smartgym.lk",
      phone: "+94 77 111 2233",
      note: "Membership plans, renewals, and billing questions.",
    },
    {
      id: 2,
      team: "Trainer Coordination",
      email: "trainers@smartgym.lk",
      phone: "+94 77 111 2244",
      note: "Session scheduling, trainer availability, and class timing.",
    },
    {
      id: 3,
      team: "Technical Support",
      email: "support@smartgym.lk",
      phone: "+94 77 111 2255",
      note: "Login issues, account access, and system-related assistance.",
    },
  ];

  const faqItems = [
    {
      id: 1,
      question: "How quickly can I expect a reply?",
      answer:
        "Most inquiries are answered within the same day during opening hours. Complex requests may take up to 24 hours.",
    },
    {
      id: 2,
      question: "Can I contact the gym for urgent membership issues?",
      answer:
        "Yes. Use the phone contact for urgent membership or account issues for the fastest response.",
    },
    {
      id: 3,
      question: "Do you support both members and trainers?",
      answer:
        "Yes. Our support team handles inquiries from members, trainers, and admin staff.",
    },
  ];

  const validateField = (fieldName, rawValue) => {
    const value = String(rawValue || "").trim();
    if (fieldName === "name") {
      if (!value) return "Name is required.";
      if (value.length < 2) return "Name must be at least 2 characters.";
      if (value.length > 60) return "Name cannot exceed 60 characters.";
      if (!/^[A-Za-z\s]+$/.test(value)) return "Name can contain letters only.";
      return "";
    }
    if (fieldName === "email") {
      if (!value) return "Email is required.";
      if (!EMAIL_RE.test(value)) return "Please enter a valid email address.";
      if (value.length > 120) return "Email cannot exceed 120 characters.";
      return "";
    }
    if (fieldName === "subject") {
      if (!value) return "Subject is required.";
      if (value.length < 3) return "Subject must be at least 3 characters.";
      if (value.length > 120) return "Subject cannot exceed 120 characters.";
      return "";
    }
    if (fieldName === "message") {
      if (!value) return "Message is required.";
      if (value.length < 10) return "Message must be at least 10 characters.";
      if (value.length > 1000) return "Message cannot exceed 1000 characters.";
      return "";
    }
    return "";
  };

  const validateForm = (payload) => {
    const nextErrors = {
      name: validateField("name", payload.name),
      email: validateField("email", payload.email),
      subject: validateField("subject", payload.subject),
      message: validateField("message", payload.message),
    };

    Object.keys(nextErrors).forEach((key) => {
      if (!nextErrors[key]) delete nextErrors[key];
    });

    return nextErrors;
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    if (feedback.text) setFeedback({ type: "", text: "" });
  };

  const handleFieldBlur = (event) => {
    const { name, value } = event.target;
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSendMessage = async () => {
    const formErrors = validateForm(formData);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) {
      setFeedback({
        type: "error",
        text: "Please fix the highlighted fields before sending your message.",
      });
      return;
    }

    setSending(true);
    setFeedback({ type: "", text: "" });

    try {
      const response = await fetch(apiClient.contact.create, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to send message");
      }

      setFeedback({ type: "success", text: "Message sent to admin successfully." });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setFeedback({ type: "error", text: error.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 text-slate-900 overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100"></div>
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        ></div>
        <div className="absolute top-24 left-12 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div
          className="absolute bottom-20 right-12 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 pt-32 pb-24">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <p className="hero-eyebrow mb-6">We&apos;re here to help</p>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight text-slate-900">
              Get in touch with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">Smart Gym</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Memberships, schedules, or platform access—send a message and we&apos;ll route it to the right team.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 max-w-3xl mx-auto">
              {[
                { n: "24/7", l: "Tracking", d: "Follow every inquiry" },
                { n: "Fast", l: "Replies", d: "Same-day when we can" },
                { n: "Direct", l: "To admins", d: "No runaround" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="rounded-2xl border border-slate-200/90 bg-white/85 px-5 py-5 shadow-md backdrop-blur-sm"
                >
                  <h3 className="text-2xl font-bold text-blue-600 sm:text-3xl">{s.n}</h3>
                  <p className="mt-1 font-semibold text-slate-900">{s.l}</p>
                  <p className="mt-1 text-xs text-slate-600">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {contactItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="marketing-panel p-6 sm:p-8 transition hover:border-blue-200"
                >
                  <div className="flex items-center justify-center w-14 h-14 bg-blue-600/15 rounded-xl mb-5">
                    <Icon className="text-blue-600 text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-slate-900">{item.title}</h3>
                  <p className="text-slate-900 font-semibold mb-2">{item.detail}</p>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.note}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="marketing-panel p-8 sm:p-10 border-blue-100/80 bg-gradient-to-br from-white to-blue-50/20">
              <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-slate-900">Send an inquiry</h2>
              <p className="text-slate-600 text-sm mb-8">Fields marked with validation will highlight if something needs attention.</p>
              <div className="space-y-4">
                <label className="block">
                  <span className="block text-sm font-semibold text-slate-700 mb-2">Your name</span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    placeholder="Enter your full name"
                    maxLength={60}
                    aria-invalid={Boolean(errors.name)}
                    className={`w-full px-4 py-3 rounded-lg border bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 ${
                      errors.name ? "border-red-400" : "border-slate-300"
                    }`}
                  />
                </label>
                {errors.name ? <p className="text-sm text-red-700 -mt-3">{errors.name}</p> : null}
                <label className="block">
                  <span className="block text-sm font-semibold text-slate-700 mb-2">Your email</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    placeholder="name@example.com"
                    maxLength={120}
                    aria-invalid={Boolean(errors.email)}
                    className={`w-full px-4 py-3 rounded-lg border bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 ${
                      errors.email ? "border-red-400" : "border-slate-300"
                    }`}
                  />
                </label>
                {errors.email ? <p className="text-sm text-red-700 -mt-3">{errors.email}</p> : null}
                <label className="block">
                  <span className="block text-sm font-semibold text-slate-700 mb-2">Subject</span>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    placeholder="What can we help you with?"
                    maxLength={120}
                    aria-invalid={Boolean(errors.subject)}
                    className={`w-full px-4 py-3 rounded-lg border bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 ${
                      errors.subject ? "border-red-400" : "border-slate-300"
                    }`}
                  />
                </label>
                {errors.subject ? <p className="text-sm text-red-700 -mt-3">{errors.subject}</p> : null}
                <label className="block">
                  <span className="block text-sm font-semibold text-slate-700 mb-2">Message</span>
                  <textarea
                    rows="6"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    placeholder="Write your message here..."
                    maxLength={1000}
                    aria-invalid={Boolean(errors.message)}
                    className={`w-full px-4 py-3 rounded-lg border bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 resize-none ${
                      errors.message ? "border-red-400" : "border-slate-300"
                    }`}
                  ></textarea>
                </label>
                <div className="flex items-center justify-between -mt-3">
                  {errors.message ? <p className="text-sm text-red-700">{errors.message}</p> : <span />}
                  <p className="text-xs text-slate-500">{formData.message.length}/1000</p>
                </div>
                {feedback.text && (
                  <p
                    className={`text-sm ${
                      feedback.type === "success" ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {feedback.text}
                  </p>
                )}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={sending}
                    className="ui-btn-primary px-8 disabled:opacity-60"
                  >
                    {sending ? "Sending..." : "Send message"}
                  </button>
                  {!isLoggedIn && (
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="ui-btn-ghost px-8"
                    >
                      Log in to continue
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="marketing-panel p-8 sm:p-10">
                <div className="flex items-center gap-3 mb-5">
                  <FaClock className="text-blue-600 text-2xl" />
                  <h2 className="text-2xl font-bold text-slate-900">Opening hours</h2>
                </div>
                <div className="space-y-4">
                  {hours.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border-b border-slate-200 pb-3"
                    >
                      <p className="text-slate-700">{item.day}</p>
                      <p className="text-slate-900 font-semibold">{item.time}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="marketing-panel border-blue-100/80 bg-gradient-to-br from-blue-600/5 to-white p-8 sm:p-10">
                <h2 className="text-2xl font-bold mb-3 text-slate-900">Need help fast?</h2>
                <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                  For urgent membership or account issues, call us during opening hours for the quickest response.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="ui-btn-primary px-8"
                >
                  Back to home
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="section-intro mb-10">
            <p className="section-kicker mb-2">Teams</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Department contacts</h2>
            <p className="text-slate-600 mt-3 text-base">
              Reach the right team directly for faster assistance.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {supportContacts.map((item) => (
              <div
                key={item.id}
                className="marketing-panel p-6 sm:p-8"
              >
                <h3 className="text-lg sm:text-xl font-bold text-blue-600 mb-3">
                  {item.team}
                </h3>
                <p className="text-slate-600 mb-1 text-sm">{item.email}</p>
                <p className="text-slate-900 font-semibold mb-3">{item.phone}</p>
                <p className="text-slate-600 text-sm leading-relaxed">{item.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="marketing-panel mx-auto max-w-6xl p-8 sm:p-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-slate-900">Frequently asked questions</h2>
            <p className="text-slate-600 text-sm mb-8">Quick answers before you write in.</p>
            <div className="space-y-3">
              {faqItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-blue-100/80 bg-blue-50/30 p-5 transition hover:border-blue-200 hover:bg-blue-50/50"
                >
                  <h3 className="text-lg font-bold mb-2 text-slate-900">{item.question}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Contact;



