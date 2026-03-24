import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import apiClient from "../services/apiClient";

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

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
      detail: "Colombo, Sri Lanka",
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

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendMessage = async () => {
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setFeedback({
        type: "error",
        text: "Please fill all fields before sending your message.",
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
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(255,127,17,0.1) 1px, transparent 1px), linear-gradient(rgba(255,127,17,0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        ></div>
        <div className="absolute top-24 left-12 w-72 h-72 bg-orange rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div
          className="absolute bottom-20 right-12 w-72 h-72 bg-orange rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 pt-32 pb-20">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight text-white">
              Get in Touch with Smart Gym Team
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">
              Have a question about memberships, schedules, or platform access?
              Reach out and our team will help you quickly.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12 max-w-3xl mx-auto">
              <div className="text-center">
                <h3 className="text-3xl sm:text-4xl font-bold text-orange mb-2">24/7</h3>
                <p className="text-gray-300">Inquiry Tracking</p>
              </div>
              <div className="text-center">
                <h3 className="text-3xl sm:text-4xl font-bold text-orange mb-2">Fast</h3>
                <p className="text-gray-300">Support Response</p>
              </div>
              <div className="text-center">
                <h3 className="text-3xl sm:text-4xl font-bold text-orange mb-2">Direct</h3>
                <p className="text-gray-300">Admin Assistance</p>
              </div>
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
                  className="group relative backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 sm:p-8 hover:bg-white/15 hover:border-orange/50 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange/0 to-orange/0 group-hover:from-orange/10 group-hover:to-orange/5 rounded-2xl transition-all duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-center w-14 h-14 bg-orange/20 rounded-xl mb-5 group-hover:bg-orange/30 transition-colors duration-300">
                      <Icon className="text-orange text-2xl" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                    <p className="text-white font-semibold mb-2">{item.detail}</p>
                    <p className="text-gray-300">{item.note}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 sm:p-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">Send an Inquiry</h2>
              <div className="space-y-5">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-orange"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Your email"
                  className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-orange"
                />
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Subject"
                  className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-orange"
                />
                <textarea
                  rows="5"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Write your message"
                  className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-orange resize-none"
                ></textarea>
                {feedback.text && (
                  <p
                    className={`text-sm ${
                      feedback.type === "success" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {feedback.text}
                  </p>
                )}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={sending}
                    className="bg-orange hover:bg-orange/90 text-white font-bold px-6 sm:px-8 py-2.5 rounded-lg transition-all duration-300 text-sm sm:text-base"
                  >
                    {sending ? "Sending..." : "Send Message"}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="border-2 border-orange text-orange font-bold px-6 sm:px-8 py-2.5 rounded-lg hover:bg-orange/10 transition-all duration-300 text-sm sm:text-base"
                  >
                    Login to Continue
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 sm:p-10">
                <div className="flex items-center gap-3 mb-5">
                  <FaClock className="text-orange text-2xl" />
                  <h2 className="text-3xl font-bold">Opening Hours</h2>
                </div>
                <div className="space-y-4">
                  {hours.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border-b border-white/10 pb-3"
                    >
                      <p className="text-gray-300">{item.day}</p>
                      <p className="text-white font-semibold">{item.time}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 sm:p-10">
                <h2 className="text-3xl font-bold mb-4">Need Help Fast?</h2>
                <p className="text-gray-300 mb-6">
                  For urgent membership or account-related support, contact us by
                  phone for the fastest response from our team.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="bg-orange hover:bg-orange/90 text-white font-bold px-6 sm:px-8 py-2.5 rounded-lg transition-all duration-300 text-sm sm:text-base"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold">Department Contacts</h2>
            <p className="text-gray-300 mt-3">
              Reach the right team directly for faster assistance.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {supportContacts.map((item) => (
              <div
                key={item.id}
                className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 sm:p-8"
              >
                <h3 className="text-xl sm:text-2xl font-bold text-orange mb-3">
                  {item.team}
                </h3>
                <p className="text-gray-300 mb-1">{item.email}</p>
                <p className="text-gray-200 font-semibold mb-3">{item.phone}</p>
                <p className="text-gray-300 text-sm sm:text-base">{item.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 sm:p-10 max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqItems.map((item) => (
                <div
                  key={item.id}
                  className="border border-white/15 rounded-xl p-5 bg-black/20"
                >
                  <h3 className="text-lg sm:text-xl font-bold mb-2">{item.question}</h3>
                  <p className="text-gray-300">{item.answer}</p>
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
