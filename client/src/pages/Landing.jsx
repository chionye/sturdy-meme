import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Logo from '../components/ui/Logo';
import {
  FiCheckCircle, FiShield, FiTrendingUp, FiUsers, FiAward, FiGlobe,
  FiArrowRight, FiBarChart2, FiClock, FiMail,
  FiMapPin, FiCalendar, FiChevronLeft, FiChevronRight, FiInfo,
} from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { getActiveHeroSlides, getExecutives, getEvents } from '../api/content';
import { formatDate } from '../utils';

const API_BASE = 'https://api.eopanse.com.ng';

const HeroCarousel = () => {
  const { data: slidesData } = useQuery({
    queryKey: ['hero-slides'],
    queryFn: () => getActiveHeroSlides().then(r => r.data),
    refetchOnMount: false,
  });
  const slides = slidesData?.length ? slidesData : [
    { image: null, title: 'Nigeria\'s Premier Event Industry Platform', subtitle: 'Transparent, secure, and professional voting for the South/East event industry' },
  ];
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  return (
    <section className="relative h-[80vh] min-h-[500px] max-h-[800px] overflow-hidden">
      {slides.map((slide, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {slide.image ? (
            <>
              <img src={`${API_BASE}${slide.image}`} alt={slide.title || ''} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800" />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
              <div className="flex flex-col items-center mb-6">
                <Logo size="xl" className="brightness-0 invert mb-4" />
                <p className="text-purple-300/90 text-sm font-bold uppercase tracking-widest">Event Organizers & Practitioners Association</p>
              </div>
              {slide.title && (
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">{slide.title}</h1>
              )}
              {slide.subtitle && <p className="text-lg sm:text-xl text-purple-100/90 mb-8 max-w-2xl mx-auto">{slide.subtitle}</p>}
              {!slide.title && (
                <>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                    Nigeria's Premier
                    <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Event Industry Voting Platform</span>
                  </h1>
                  <p className="text-lg sm:text-xl text-purple-200 mb-8 max-w-2xl mx-auto">Transparent, secure, and professional voting for the South/East event industry. Covering 11 member states across Nigeria.</p>
                </>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-purple-900 font-bold py-4 px-8 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 text-lg">
                  Join EOPANSE <FiArrowRight className="h-5 w-5" />
                </Link>
                <Link to="/login" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white border border-white/30 font-bold py-4 px-8 rounded-xl hover:bg-white/20 transition-all duration-200 text-lg">
                  Sign In to Vote
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur text-white flex items-center justify-center hover:bg-white/20 transition-all">
            <FiChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur text-white flex items-center justify-center hover:bg-white/20 transition-all">
            <FiChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'}`} />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

const Stats = () => (
  <div className="bg-gradient-to-r from-purple-700 to-indigo-700 py-6">
    <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-6">
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
);

const StatesBanner = () => (
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
);

const Benefits = () => (
  <section className="py-20 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-14">
        <p className="text-primary-600 font-semibold uppercase tracking-wide text-sm mb-3">Why Join</p>
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Benefits of Joining EOPANSE</h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { icon: FiAward, title: 'Professional Recognition & Credibility', desc: 'Become part of a recognized professional body that validates your expertise and boosts your reputation in the events industry.' },
          { icon: FiTrendingUp, title: 'Access to Training & Growth', desc: 'Gain access to continuous training, workshops, and industry insights designed to improve your skills and keep you ahead of trends.' },
          { icon: FiGlobe, title: 'Business Exposure & Promotion', desc: 'Showcase your brand through the association\'s platforms, events, and publications, increasing your visibility to potential clients and partners.' },
          { icon: FiUsers, title: 'Networking & Strategic Connections', desc: 'Connect with fellow event professionals, vendors, and stakeholders, creating valuable relationships and business collaborations.' },
          { icon: FiMapPin, title: 'Inter-State Vendor Collaboration', desc: 'Benefit from a strong network that fosters collaboration among vendors across different states for partnerships and resource sharing.' },
          { icon: FiShield, title: 'Support, Protection & Standards', desc: 'Benefit from a structured support system, including conflict resolution, ethical guidance, and standards that protect your business.' },
        ].map((b, i) => (
          <div key={i} className="card hover:shadow-lg hover:border-purple-200 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center mb-4 group-hover:from-purple-600 group-hover:to-indigo-600 transition-colors">
              <b.icon className="h-6 w-6 text-purple-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{b.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const EventsSection = () => {
  const { data: eventsData } = useQuery({
    queryKey: ['landing-events'],
    queryFn: () => getEvents({ status: 'upcoming' }).then(r => r.data),
  });
  const events = eventsData || [];

  if (!events.length) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-primary-600 font-semibold uppercase tracking-wide text-sm mb-3">Events</p>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Upcoming Events</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link key={event.id} to={`/events/${event.id}`} className="card overflow-hidden hover:shadow-xl transition-all group">
              {event.images?.[0] && (
                <div className="aspect-video overflow-hidden">
                  <img src={`${API_BASE}${event.images[0]}`} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  {event.date && <span className="flex items-center gap-1"><FiCalendar className="h-3.5 w-3.5" />{formatDate(event.date)}</span>}
                  {event.location && <span className="flex items-center gap-1"><FiMapPin className="h-3.5 w-3.5" />{event.location}</span>}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-purple-600 transition-colors">{event.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{event.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

const ExecutivesSection = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [filter, setFilter] = useState('all');
  const { data: execsData } = useQuery({
    queryKey: ['landing-executives'],
    queryFn: () => getExecutives().then(r => r.data),
  });
  const execs = execsData || [];

  const states = [...new Set(execs.map((e) => e.state))].sort();
  const filtered = execs.filter((e) => {
    if (activeTab !== 'all' && e.state !== activeTab) return false;
    if (filter === 'executive' && e.isBoardMember) return false;
    if (filter === 'board' && !e.isBoardMember) return false;
    return true;
  });
  const [carouselIndex, setCarouselIndex] = useState(0);
  const itemsPerPage = typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 3;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  useEffect(() => {
    setCarouselIndex(0);
  }, [activeTab, filter]);

  useEffect(() => {
    if (totalPages <= 1) return;
    const timer = setInterval(() => setCarouselIndex((c) => (c + 1) % totalPages), 4000);
    return () => clearInterval(timer);
  }, [totalPages]);

  if (!execs.length) return null;

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-primary-600 font-semibold uppercase tracking-wide text-sm mb-3">Leadership</p>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Our Executives & Board of Directors</h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-200">
            {[
              { key: 'all', label: 'All' },
              { key: 'executive', label: 'Executives' },
              { key: 'board', label: 'Board of Directors' },
            ].map((t) => (
              <button key={t.key} onClick={() => setFilter(t.key)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === t.key ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-600 hover:text-purple-600'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <button onClick={() => setActiveTab('all')} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${activeTab === 'all' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'}`}>
            All States
          </button>
          {states.map((s) => (
            <button key={s} onClick={() => setActiveTab(s)} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${activeTab === s ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'}`}>
              {s}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FiUsers className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No members found for this selection</p>
          </div>
        ) : (
          <div className="relative">
            <div className="overflow-hidden">
              <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${carouselIndex * (100 / itemsPerPage)}%)` }}>
                {filtered.map((exec) => (
                  <div key={exec.id} className="min-w-full sm:min-w-[50%] lg:min-w-[33.333%] p-2">
                    <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 hover:shadow-xl transition-all h-full">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 mx-auto mb-4 overflow-hidden">
                        {exec.image ? (
                          <img src={`${API_BASE}${exec.image}`} alt={exec.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl font-black text-purple-600">{exec.name?.[0]}</div>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900">{exec.name}</h3>
                      {exec.businessName && <p className="text-xs text-gray-500 mt-0.5">{exec.businessName}</p>}
                      <p className="text-sm text-purple-600 font-semibold mt-1.5">{exec.position}</p>
                      <div className="flex items-center justify-center gap-2 mt-3">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">{exec.state}</span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full ${exec.isBoardMember ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                          {exec.isBoardMember ? 'Board of Director' : 'Executive'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <button onClick={() => setCarouselIndex((c) => Math.max(0, c - 1))} disabled={carouselIndex === 0} className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-purple-50 disabled:opacity-30 transition-all">
                  <FiChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex gap-1.5">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button key={i} onClick={() => setCarouselIndex(i)} className={`w-2 h-2 rounded-full transition-all ${i === carouselIndex ? 'bg-purple-600 w-4' : 'bg-gray-300'}`} />
                  ))}
                </div>
                <button onClick={() => setCarouselIndex((c) => Math.min(totalPages - 1, c + 1))} disabled={carouselIndex === totalPages - 1} className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-purple-50 disabled:opacity-30 transition-all">
                  <FiChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

const AboutSection = () => (
  <section id="about" className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-primary-600 font-semibold uppercase tracking-wide text-sm mb-3">About EOPANSE</p>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6 leading-tight">
            The Professional Body for the Event Industry South/East
          </h2>
          <p className="text-gray-600 text-lg mb-6 leading-relaxed">
            The Event Organizers and Practitioners Association of Nigeria South/East (EOPANSE) is
            the professional support structure for all Event Planners and Event Vendors in the Southern
            and Eastern parts of Nigeria.
          </p>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
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
          <Link to="/about" className="inline-flex items-center gap-2 text-primary-600 font-bold hover:text-primary-700 mt-6 transition-colors">
            <FiInfo className="h-4 w-4" /> Learn More About EOPANSE <FiArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: FiGlobe, title: '11 Member States', desc: 'Covering the entire South/East region', color: 'purple' },
            { icon: FiShield, title: 'Secure Voting', desc: 'Transparent and auditable results', color: 'green' },
            { icon: FiAward, title: 'Excellence Awards', desc: 'Recognizing outstanding members', color: 'orange' },
            { icon: FiTrendingUp, title: 'Industry Growth', desc: 'Supporting business development', color: 'blue' },
          ].map((item) => (
            <div key={item.title} className="card hover:shadow-md transition-shadow">
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
);

const HowItWorks = () => (
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
);

const Features = () => (
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
);

const MembershipCTA = () => (
  <section id="membership" className="py-20 bg-gradient-to-br from-purple-900 to-indigo-900">
    <div className="max-w-4xl mx-auto px-4 text-center">
      <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">Ready to Join EOPANSE?</h2>
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
);

const Footer = () => (
  <footer className="bg-gray-900 text-gray-400 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-4 gap-8 mb-8">
        <div className="md:col-span-2">
          <Logo size="sm" className="brightness-0 invert mb-4" />
          <p className="text-sm leading-relaxed max-w-md">
            The Event Organizers and Practitioners Association of Nigeria South/East.
            Professional body for the event industry excellence.
          </p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Quick Links</h4>
          <div className="space-y-2 text-sm">
            <Link to="/about" className="block hover:text-white transition-colors">About Us</Link>
            <Link to="/constitution" className="block hover:text-white transition-colors">Constitution</Link>
            <Link to="/register" className="block hover:text-white transition-colors">Join EOPANSE</Link>
            <Link to="/login" className="block hover:text-white transition-colors">Member Login</Link>
            <Link to="/admin/login" className="block hover:text-white transition-colors">Admin Portal</Link>
          </div>
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
      </div>
      <div className="border-t border-gray-800 pt-6 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} EOPANSE. All rights reserved. | eopanse.com.ng</p>
      </div>
    </div>
  </footer>
);

const Landing = () => {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          const offset = 80;
          const top = el.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 300);
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroCarousel />
      <Stats />
      <StatesBanner />
      <AboutSection />
      <Benefits />
      <HowItWorks />
      <Features />
      <EventsSection />
      <ExecutivesSection />
      <MembershipCTA />
      <Footer />
    </div>
  );
};

export default Landing;
