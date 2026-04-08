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

      <div className="relative z-10 pt-32 pb-24">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <p className="hero-eyebrow mb-6">Built for real gyms</p>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight text-slate-900">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
                Smart Gym
              </span>{" "}
              <span className="text-slate-900">Management System</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
              We exist to make daily gym operations clear and calm. Spend less time juggling
              paperwork and more time helping members succeed.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="marketing-panel mx-auto max-w-5xl p-8 sm:p-10 md:p-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-slate-900">Who we are</h2>
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
            <div className="marketing-panel p-8 border-blue-100/80 bg-gradient-to-br from-white to-blue-50/30">
              <h2 className="text-3xl font-bold mb-4 text-slate-900">Our mission</h2>
              <p className="text-slate-600 leading-relaxed">
                To help gyms run smoother by turning complex processes into simple,
                clear, and connected digital workflows.
              </p>
            </div>
            <div className="marketing-panel p-8 border-blue-100/80 bg-gradient-to-br from-white to-blue-50/30">
              <h2 className="text-3xl font-bold mb-4 text-slate-900">Our vision</h2>
              <p className="text-slate-600 leading-relaxed">
                To become a trusted system that supports modern fitness centers in
                delivering better member experiences every day.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="marketing-panel mx-auto max-w-6xl p-8 sm:p-10 md:p-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-slate-900">What this platform covers</h2>
            <p className="text-slate-600 mb-8 max-w-2xl">A single place for the workflows your team repeats every week.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50/40 px-4 py-4 sm:px-5 transition hover:border-blue-200 hover:bg-blue-50/70"
                >
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" aria-hidden />
                  <p className="text-slate-800 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="section-intro mb-10 sm:mb-12">
            <p className="section-kicker mb-2">Principles</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">What we value</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.id}
                  className="marketing-panel p-6 sm:p-8 transition hover:border-blue-200"
                >
                  <div className="flex items-center justify-center w-14 h-14 bg-blue-600/15 rounded-xl mb-5">
                    <Icon className="text-blue-600 text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-slate-900">{value.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="section-intro mb-10 sm:mb-12">
            <p className="section-kicker mb-2">Timeline</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Our journey</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="marketing-panel p-6 sm:p-8 border-t-4 border-t-blue-500"
              >
                <p className="text-blue-600 font-bold text-lg mb-2">{milestone.year}</p>
                <h3 className="text-xl font-bold mb-3 text-slate-900">{milestone.title}</h3>
                <p className="text-slate-600 leading-relaxed">{milestone.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="section-intro mb-10 sm:mb-12">
            <p className="section-kicker mb-2">Roles</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Built for every gym role</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {teamRoles.map((item) => (
              <div
                key={item.id}
                className="marketing-panel p-6 sm:p-8"
              >
                <h3 className="text-xl font-bold text-blue-600 mb-3">{item.role}</h3>
                <p className="text-slate-600 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="section-intro mb-10">
            <p className="section-kicker mb-2">Trust</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Why gyms choose us</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {[
              { t: "Easy", d: "Simple workflows for daily operations" },
              { t: "Fast", d: "Quick access to key gym tasks" },
              { t: "Reliable", d: "Consistent support for members and staff" },
            ].map((x) => (
              <div
                key={x.t}
                className="rounded-2xl border border-slate-200/90 bg-white/80 px-6 py-8 text-center shadow-sm backdrop-blur-sm transition hover:border-blue-200 hover:shadow-md"
              >
                <h3 className="text-3xl font-bold text-blue-600 mb-2 sm:text-4xl">{x.t}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{x.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="section-intro mb-10">
            <p className="section-kicker mb-2">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Frequently asked questions</h2>
          </div>
          <div className="max-w-5xl mx-auto space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="marketing-panel p-6 sm:p-8"
              >
                <h3 className="text-lg sm:text-xl font-bold mb-2 text-slate-900">{faq.question}</h3>
                <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="marketing-panel mx-auto max-w-5xl overflow-hidden border-blue-200/60 bg-gradient-to-br from-blue-600/8 via-white to-blue-50/40 p-8 text-center sm:p-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-slate-900">
              Explore the platform
            </h2>
            <p className="text-slate-600 text-base sm:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              See how Smart Gym supports trainers, staff, and members in one connected workflow.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="ui-btn-primary px-8 justify-center"
              >
                Create account
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="ui-btn-ghost px-8 justify-center"
              >
                Back to home
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;



