import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import {
  FiCheckCircle, FiShield, FiTrendingUp, FiUsers, FiAward, FiGlobe,
  FiArrowRight, FiBarChart2, FiClock, FiMail,
} from 'react-icons/fi';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-20 bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-400 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo/Brand */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
                <span className="text-white font-black text-2xl">E</span>
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-black text-white leading-none">EOPANSE</h1>
                <p className="text-purple-300 text-sm">Event Organizers & Practitioners Association</p>
              </div>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              Nigeria's Premier
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Event Industry Voting Platform
              </span>
            </h2>
            <p className="text-xl text-purple-200 mb-10 max-w-2xl mx-auto leading-relaxed">
              Transparent, secure, and professional voting for the South/East event industry.
              Covering 11 member states across Nigeria.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-purple-900 font-bold py-4 px-8 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 text-lg">
                Become a Member <FiArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white border border-white/30 font-bold py-4 px-8 rounded-xl hover:bg-white/20 transition-all duration-200 text-lg">
                Sign In to Vote
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-16 max-w-2xl mx-auto">
              {[
                { label: 'Member States', value: '11' },
                { label: 'Years Serving', value: '5+' },
                { label: 'Active Members', value: '500+' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-black text-white">{stat.value}</div>
                  <div className="text-purple-300 text-sm mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* States Banner */}
      <section className="bg-gradient-to-r from-purple-700 to-indigo-700 py-4 overflow-hidden">
        <div className="flex animate-marquee-slow gap-8 text-white/80 text-sm font-medium whitespace-nowrap">
          {['Abia', 'Akwa-Ibom', 'Anambra', 'Bayelsa', 'Cross Rivers', 'Delta', 'Ebonyi', 'Edo', 'Enugu', 'Imo', 'Rivers',
            'Abia', 'Akwa-Ibom', 'Anambra', 'Bayelsa', 'Cross Rivers', 'Delta', 'Ebonyi', 'Edo', 'Enugu', 'Imo', 'Rivers'].map((s, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" /> {s}
            </span>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-primary-600 font-semibold uppercase tracking-wide text-sm mb-3">About EOPANSE</p>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6 leading-tight">
                The Professional Body for Event Industry South/East
              </h2>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                The Event Organizers and Practitioners Association of Nigeria South/East (EOPANSE) is
                the professional support structure for all Event Planners and Vendors in the Southern
                and Eastern parts of Nigeria.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Our mission is to Promote, Grow and ensure Visibility of the Nigerian Eastern and
                Southern Event Industry, by Promoting Professionalism, Integrity, Confidence, Love
                and Brotherliness among all Event Vendors operating in all our Member States.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {['Integrity', 'Professionalism', 'Accountability', 'Excellence', 'Innovation', 'Growth'].map((v) => (
                  <div key={v} className="flex items-center gap-2 text-gray-700 font-medium">
                    <FiCheckCircle className="h-5 w-5 text-primary-600 flex-shrink-0" /> {v}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: FiGlobe, title: '11 Member States', desc: 'Covering the entire South/East region', color: 'purple' },
                { icon: FiShield, title: 'Secure Voting', desc: 'Transparent and auditable results', color: 'green' },
                { icon: FiAward, title: 'Excellence Awards', desc: 'Recognizing outstanding members', color: 'orange' },
                { icon: FiTrendingUp, title: 'Industry Growth', desc: 'Supporting business development', color: 'blue' },
              ].map((item) => (
                <div key={item.title} className={`card hover:shadow-md transition-shadow`}>
                  <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${
                    item.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                    item.color === 'green' ? 'bg-green-100 text-green-600' :
                    item.color === 'orange' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-primary-600 font-semibold uppercase tracking-wide text-sm mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Simple & Transparent Process</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', icon: FiUsers, title: 'Register as Member', desc: 'Sign up and pay the membership fee to get your unique member code', color: 'purple' },
              { step: '02', icon: FiMail, title: 'Get Activated', desc: 'Admin reviews and activates your account. Receive your voting link via email', color: 'indigo' },
              { step: '03', icon: FiCheckCircle, title: 'Cast Your Votes', desc: 'Log in to participate in ongoing votes and elections on the platform', color: 'green' },
              { step: '04', icon: FiBarChart2, title: 'See Results', desc: 'View live leaderboards, results and analytics for all completed votes', color: 'orange' },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center">
                {i < 3 && <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary-200 to-primary-100" />}
                <div className="relative z-10">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-600 mx-auto flex items-center justify-center mb-4 shadow-lg">
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                  <span className="text-primary-600 font-black text-sm">{item.step}</span>
                  <h3 className="font-bold text-gray-900 text-lg mt-1 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-primary-600 font-semibold uppercase tracking-wide text-sm mb-3">Platform Features</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Everything You Need</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: FiShield, title: 'Secure Authentication', desc: 'Members-only access with unique member codes tied to your state' },
              { icon: FiBarChart2, title: 'Live Analytics', desc: 'Real-time vote tracking, leaderboards, and comprehensive results' },
              { icon: FiMail, title: 'Email Notifications', desc: 'Receive voting links, confirmations and results directly to your email' },
              { icon: FiClock, title: 'Timed Elections', desc: 'Set start and end dates for elections with automatic status management' },
              { icon: FiAward, title: 'Multiple Vote Types', desc: 'Free votes or paid votes with configurable pricing per ballot' },
              { icon: FiTrendingUp, title: 'Detailed Reports', desc: 'Printable financial and voting reports for complete transparency' },
            ].map((f) => (
              <div key={f.title} className="card hover:shadow-md hover:border-primary-200 transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                  <f.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership CTA */}
      <section id="membership" className="py-20 bg-gradient-to-br from-purple-900 to-indigo-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">
            Ready to Join EOPANSE?
          </h2>
          <p className="text-purple-200 text-lg mb-4">
            Register today to become part of the premier event industry association in Nigeria's South/East region.
          </p>
          <p className="text-yellow-400 font-bold text-xl mb-8">
            One-time registration fee gives you full voting access.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-purple-900 font-bold py-4 px-8 rounded-xl hover:shadow-2xl hover:scale-105 transition-all text-lg">
              Register Now <FiArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white font-bold py-4 px-8 rounded-xl hover:bg-white/20 transition-all text-lg">
              Already a Member? Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                  <span className="text-white font-black text-xs">E</span>
                </div>
                <span className="font-black text-white text-lg">EOPANSE</span>
              </div>
              <p className="text-sm leading-relaxed">
                The Event Organizers and Practitioners Association of Nigeria South/East.
                Professional body for event industry excellence.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Member States</h4>
              <div className="grid grid-cols-2 gap-1 text-sm">
                {['Abia', 'Akwa-Ibom', 'Anambra', 'Bayelsa', 'Cross Rivers', 'Delta', 'Ebonyi', 'Edo', 'Enugu', 'Imo', 'Rivers'].map((s) => (
                  <span key={s} className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-primary-500 rounded-full" /> {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <Link to="/register" className="block hover:text-white transition-colors">Join EOPANSE</Link>
                <Link to="/login" className="block hover:text-white transition-colors">Member Login</Link>
                <Link to="/admin/login" className="block hover:text-white transition-colors">Admin Portal</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-sm">
            <p>© {new Date().getFullYear()} EOPANSE. All rights reserved. | eopanse.com.ng</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
