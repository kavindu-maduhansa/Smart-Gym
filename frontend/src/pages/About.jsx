import { useNavigate } from "react-router-dom";
import { FaDumbbell, FaUsers, FaClock } from "react-icons/fa";

const About = () => {
  const navigate = useNavigate();

  const values = [
    {
      id: 1,
      icon: FaDumbbell,
      title: "Practical Training Focus",
      description:
        "We design tools that help members and trainers stay focused on real progress, not paperwork.",
    },
    {
      id: 2,
      icon: FaUsers,
      title: "Built for Real Gym Teams",
      description:
        "From front desk staff to coaches, every workflow is made to be simple, fast, and reliable.",
    },
    {
      id: 3,
      icon: FaClock,
      title: "Always Available",
      description:
        "Scheduling, memberships, and day-to-day operations are accessible any time your gym is open.",
    },
  ];

  const milestones = [
    {
      id: 1,
      year: "2023",
      title: "Concept Started",
      description:
        "We began with one goal: simplify everyday gym operations in a single platform.",
    },
    {
      id: 2,
      year: "2024",
      title: "Core Modules Added",
      description:
        "Membership handling, schedules, and role-based dashboards were integrated.",
    },
    {
      id: 3,
      year: "Now",
      title: "Continuous Improvement",
      description:
        "We keep refining the system based on real gym workflows and user feedback.",
    },
  ];

  const faqs = [
    {
      id: 1,
      question: "Who can use Smart Gym Management System?",
      answer:
        "The platform is designed for gym admins, trainers, and members with dedicated flows for each role.",
    },
    {
      id: 2,
      question: "What makes this platform practical?",
      answer:
        "It combines daily gym operations into one place, reducing manual steps and improving team coordination.",
    },
    {
      id: 3,
      question: "Is it suitable for growing gyms?",
      answer:
        "Yes. The system is structured to remain easy to use as member count and services increase.",
    },
  ];

  const teamRoles = [
    {
      id: 1,
      role: "Gym Admins",
      text: "Track memberships, handle requests, and manage operations from one place.",
    },
    {
      id: 2,
      role: "Trainers",
      text: "Access schedules quickly and coordinate sessions with less manual work.",
    },
    {
      id: 3,
      role: "Members",
      text: "Stay informed about memberships, renewals, and gym-related services.",
    },
  ];

  const highlights = [
    "Clear dashboard experience for each role",
    "Membership and renewal workflows",
    "Operational visibility for daily gym management",
    "Design language that is clean and easy to navigate",
  ];

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

      <div className="relative z-10 pt-32 pb-20">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
              <span className="text-slate-900">Smart Gym Management System</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-700 leading-relaxed">
              Smart Gym Management System was created to make daily gym operations
              clear and organized. Our goal is simple: help gyms spend less time
              managing processes and more time supporting member results.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl p-8 sm:p-10 max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Who We Are</h2>
            <p className="text-slate-700 text-base sm:text-lg leading-relaxed mb-4">
              We are a team focused on improving how modern gyms run. This
              platform brings together member management, scheduling, and key
              services in one place, so both admins and members can move through
              tasks without confusion.
            </p>
            <p className="text-slate-700 text-base sm:text-lg leading-relaxed">
              Whether your gym is growing or already well-established, the system
              is designed to stay straightforward, responsive, and easy to work
              with every day.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
            <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl p-8">
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-slate-700 leading-relaxed">
                To help gyms run smoother by turning complex processes into simple,
                clear, and connected digital workflows.
              </p>
            </div>
            <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl p-8">
              <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
              <p className="text-slate-700 leading-relaxed">
                To become a trusted system that supports modern fitness centers in
                delivering better member experiences every day.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl p-8 sm:p-10 max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-5">What This Platform Covers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="border border-slate-200 rounded-xl px-5 py-4 bg-blue-50/20"
                >
                  <p className="text-slate-800">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold">What We Value</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.id}
                  className="group relative backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl p-6 sm:p-8 hover:bg-white/15 hover:border-blue-600/50 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/10 group-hover:to-blue-600/5 rounded-2xl transition-all duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-center w-14 h-14 bg-blue-600/20 rounded-xl mb-5 group-hover:bg-blue-700/30 transition-colors duration-300">
                      <Icon className="text-blue-600 text-2xl" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{value.title}</h3>
                    <p className="text-slate-700">{value.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold">Our Journey</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl p-6 sm:p-8"
              >
                <p className="text-blue-600 font-bold text-lg mb-2">{milestone.year}</p>
                <h3 className="text-2xl font-bold mb-3">{milestone.title}</h3>
                <p className="text-slate-700">{milestone.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold">Built for Every Gym Role</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {teamRoles.map((item) => (
              <div
                key={item.id}
                className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl p-6 sm:p-8"
              >
                <h3 className="text-2xl font-bold text-blue-600 mb-3">{item.role}</h3>
                <p className="text-slate-700">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold">Why Gyms Choose Us</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <h3 className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">Easy</h3>
              <p className="text-slate-700">Simple workflows for daily operations</p>
            </div>
            <div className="text-center">
              <h3 className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">Fast</h3>
              <p className="text-slate-700">Quick access to key gym tasks</p>
            </div>
            <div className="text-center">
              <h3 className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">Reliable</h3>
              <p className="text-slate-700">Consistent support for members and staff</p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold">Frequently Asked Questions</h2>
          </div>
          <div className="max-w-5xl mx-auto space-y-5">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl p-6 sm:p-8"
              >
                <h3 className="text-xl sm:text-2xl font-bold mb-2">{faq.question}</h3>
                <p className="text-slate-700">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="backdrop-blur-md bg-gradient-to-r from-blue-600/10 to-blue-600/5 border border-blue-600/30 rounded-3xl p-8 sm:p-12 text-center max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Explore the Platform
            </h2>
            <p className="text-slate-700 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
              Take a look around and see how Smart Gym Management System supports
              trainers, staff, and members in one connected workflow.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-600/50"
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-8 py-3 border-2 border-blue-600 text-blue-600 font-bold rounded-lg hover:bg-blue-700/10 transition-all duration-300 transform hover:scale-105"
              >
                Back to Home
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;



