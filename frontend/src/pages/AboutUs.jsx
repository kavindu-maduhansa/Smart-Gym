import { Link } from "react-router-dom";
import {
  FaDumbbell,
  FaUsers,
  FaHeartbeat,
  FaBullseye,
  FaClock,
  FaShieldAlt,
  FaChartLine,
  FaMapMarkerAlt,
  FaCheckCircle,
} from "react-icons/fa";

const AboutUs = () => {
  const values = [
    {
      id: 1,
      icon: FaBullseye,
      title: "Our Mission",
      description:
        "Help gyms run smarter with simple, reliable digital tools for memberships, schedules, and daily operations.",
    },
    {
      id: 2,
      icon: FaUsers,
      title: "Member First",
      description:
        "We design every feature to improve the member experience, from quick support to smooth service access.",
    },
    {
      id: 3,
      icon: FaHeartbeat,
      title: "Built for Fitness",
      description:
        "Created with real gym workflows in mind, so trainers, staff, and students can focus on progress.",
    },
  ];

  const milestones = [
    {
      id: 1,
      year: "2021",
      title: "Foundation",
      description:
        "Our first team started mapping daily gym operations and common pain points.",
    },
    {
      id: 2,
      year: "2022",
      title: "Platform Launch",
      description:
        "Membership, scheduling, and dashboard modules were launched for early users.",
    },
    {
      id: 3,
      year: "2023",
      title: "Service Expansion",
      description:
        "Supplement and inventory workflows were added to support full gym operations.",
    },
    {
      id: 4,
      year: "2024",
      title: "Continuous Improvement",
      description:
        "Performance, usability, and reporting upgrades were delivered based on user feedback.",
    },
  ];

  const highlights = [
    {
      id: 1,
      icon: FaClock,
      title: "Fast Daily Workflow",
      description:
        "Reduce manual tasks with streamlined registration, schedule, and management flows.",
    },
    {
      id: 2,
      icon: FaShieldAlt,
      title: "Reliable Data Handling",
      description:
        "Organized member records and role-based access for better control and confidence.",
    },
    {
      id: 3,
      icon: FaChartLine,
      title: "Actionable Insights",
      description:
        "Monitor operational activity using clear dashboards and real-time information.",
    },
    {
      id: 4,
      icon: FaMapMarkerAlt,
      title: "Built for Local Gyms",
      description:
        "Designed around practical gym routines, service expectations, and community needs.",
    },
  ];

  const programs = [
    "Strength Training Plans",
    "Weight Management Guidance",
    "Beginner Friendly Onboarding",
    "Flexible Class Scheduling",
    "Trainer Support Sessions",
    "Nutrition and Supplement Advice",
  ];

  const testimonials = [
    {
      id: 1,
      name: "Nimal Perera",
      role: "Gym Member",
      feedback:
        "The system is very easy to use. Booking sessions and checking updates now takes only a few minutes.",
    },
    {
      id: 2,
      name: "Shehani Jayasuriya",
      role: "Front Desk Staff",
      feedback:
        "Member management is much smoother now. We spend less time on paperwork and more time helping clients.",
    },
    {
      id: 3,
      name: "Ravindu Fernando",
      role: "Trainer",
      feedback:
        "Schedules, member details, and progress follow-ups are clear in one place. It makes coaching easier.",
    },
  ];

  const faqs = [
    {
      id: 1,
      question: "Can new members register online?",
      answer:
        "Yes. New users can create an account, submit membership details, and start using services without manual forms.",
    },
    {
      id: 2,
      question: "Is the platform useful for both staff and members?",
      answer:
        "Yes. Staff can manage operations while members can track and access services through a clean interface.",
    },
    {
      id: 3,
      question: "Do you support future feature improvements?",
      answer:
        "Yes. The system is designed to grow with new requirements such as reports, class modules, and integrations.",
    },
  ];

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
          className="absolute bottom-24 right-12 w-72 h-72 bg-orange rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 pt-32 pb-20">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange to-orange/80">
                Stronger Gyms,
              </span>
              <br />
              <span className="text-white">Smarter Management</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
              Smart Gym Management System was built to support modern fitness
              centers with practical tools that reduce manual work and improve
              daily coordination.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-8 sm:p-10 md:p-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-orange/20 rounded-xl flex items-center justify-center">
                <FaDumbbell className="text-orange text-2xl" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold">Who We Are</h2>
            </div>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-4">
              We are focused on making gym administration simple and
              professional. From handling member records to supporting schedule
              and supplement operations, our platform helps teams work with
              better clarity and speed.
            </p>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
              The goal is straightforward: fewer bottlenecks, better member
              service, and more time for what really matters in a gym:
              consistent progress and healthy communities.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
              <h3 className="text-4xl font-bold text-orange mb-2">500+</h3>
              <p className="text-gray-300">Active Members Supported</p>
            </div>
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
              <h3 className="text-4xl font-bold text-orange mb-2">24/7</h3>
              <p className="text-gray-300">System Availability</p>
            </div>
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
              <h3 className="text-4xl font-bold text-orange mb-2">98%</h3>
              <p className="text-gray-300">Staff Satisfaction Score</p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Our Values</h2>
            <p className="text-gray-400 text-lg">
              Principles that guide how we build and improve this system
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {values.map((value) => {
              const IconComponent = value.icon;
              return (
                <div
                  key={value.id}
                  className="group relative backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 sm:p-8 hover:bg-white/15 hover:border-orange/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-orange/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange/0 to-orange/0 group-hover:from-orange/10 group-hover:to-orange/5 rounded-2xl transition-all duration-300"></div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-orange/20 rounded-xl mb-5 flex items-center justify-center group-hover:bg-orange/30 transition-colors duration-300">
                      <IconComponent className="text-orange text-2xl" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{value.title}</h3>
                    <p className="text-gray-300 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                  <div className="absolute inset-0 rounded-2xl border border-orange/0 group-hover:border-orange/50 transition-all duration-300 pointer-events-none"></div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Our Journey</h2>
            <p className="text-gray-400 text-lg">
              How the Smart Gym platform evolved over time
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 hover:border-orange/50 transition-all duration-300"
              >
                <p className="text-orange font-semibold text-sm tracking-wider mb-2">
                  {milestone.year}
                </p>
                <h3 className="text-2xl font-bold mb-3">{milestone.title}</h3>
                <p className="text-gray-300 leading-relaxed">
                  {milestone.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Why Teams Choose Us
            </h2>
            <p className="text-gray-400 text-lg">
              Built for real gym environments, not generic templates
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {highlights.map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.id}
                  className="group relative backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 sm:p-8 hover:bg-white/15 hover:border-orange/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange/20 rounded-lg flex items-center justify-center group-hover:bg-orange/30 transition-colors duration-300">
                      <IconComponent className="text-orange text-xl" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                      <p className="text-gray-300 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Services We Support
            </h2>
            <p className="text-gray-400 text-lg">
              Designed for modern gym programs and day-to-day operations
            </p>
          </div>
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-8 sm:p-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {programs.map((program) => (
                <div
                  key={program}
                  className="flex items-center gap-3 bg-black/20 border border-white/10 rounded-xl px-4 py-4 hover:border-orange/40 transition-all duration-300"
                >
                  <FaCheckCircle className="text-orange text-lg shrink-0" />
                  <p className="text-gray-200">{program}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              What People Say
            </h2>
            <p className="text-gray-400 text-lg">
              Feedback from members and staff using the platform
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((person) => (
              <div
                key={person.id}
                className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 hover:border-orange/50 transition-all duration-300"
              >
                <p className="text-gray-300 leading-relaxed mb-5">
                  "{person.feedback}"
                </p>
                <h3 className="text-xl font-bold text-white">{person.name}</h3>
                <p className="text-orange text-sm">{person.role}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-400 text-lg">
              Quick answers for common questions about our platform
            </p>
          </div>
          <div className="space-y-5 max-w-5xl mx-auto">
            {faqs.map((item) => (
              <div
                key={item.id}
                className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 sm:p-7"
              >
                <h3 className="text-xl sm:text-2xl font-bold mb-3 text-white">
                  {item.question}
                </h3>
                <p className="text-gray-300 leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="backdrop-blur-md bg-gradient-to-r from-orange/10 to-orange/5 border border-orange/30 rounded-3xl p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Join the Smart Gym Experience
            </h2>
            <p className="text-gray-300 text-base sm:text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Start with a platform designed for real gym needs and trusted by
              teams that value efficiency and member satisfaction.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <Link
                to="/register"
                className="px-8 sm:px-10 py-3 sm:py-4 bg-orange text-white font-bold rounded-lg hover:bg-orange/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-orange/50 text-base sm:text-lg"
              >
                Create Account
              </Link>
              <Link
                to="/contact"
                className="px-8 sm:px-10 py-3 sm:py-4 border-2 border-orange text-orange font-bold rounded-lg hover:bg-orange/10 transition-all duration-300 transform hover:scale-105 text-base sm:text-lg"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;
