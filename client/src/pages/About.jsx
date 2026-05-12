import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { FiArrowLeft, FiInfo, FiTarget, FiEye } from 'react-icons/fi';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 pb-20 bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
            <FiInfo className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">About EOPANSE</h1>
          <p className="text-purple-200 text-lg max-w-2xl mx-auto">
            Unifying and advancing the events industry across Southern and Eastern Nigeria
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 pb-20">
        <Link to="/" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium mb-6 bg-white rounded-xl px-4 py-2 shadow-sm border border-purple-100 transition-colors">
          <FiArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <p className="text-gray-700 leading-relaxed text-lg">
            The Event Organizers and Practitioners Association (EOPANSE) is a professional body dedicated to advancing the events industry across the Southern and Eastern regions of Nigeria. The association serves as a unifying platform for event professionals, fostering collaboration, growth, and excellence among its members.
          </p>
          <p className="text-gray-700 leading-relaxed mt-6">
            At its core, EOPANSE is committed to promoting the interests, welfare, and business development of its members by creating opportunities for visibility, networking, and industry advancement. Through structured trainings, publications, and information exchange.
          </p>
          <p className="text-gray-700 leading-relaxed mt-6">
            The association also plays a regulatory role by setting benchmark standards for service delivery, ensuring that members uphold high levels of professionalism, ethics, and quality in their operations. It establishes clear codes of conduct and enforces discipline through structured conflict resolution and disciplinary processes, helping to maintain integrity within the industry.
          </p>
          <p className="text-gray-700 leading-relaxed mt-6">
            In addition, EOPANSE acts as a support system for its members by addressing their welfare needs, mediating disputes, and providing a reliable framework for professional accountability. The association further celebrates and encourages excellence through awards and recognition programs, reinforcing a culture of achievement and continuous improvement.
          </p>
          <p className="text-gray-700 leading-relaxed mt-6 font-semibold text-purple-800">
            Overall, EOPANSE stands as a pillar for unity, professionalism, and sustainable growth in the events industry.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-purple-50 rounded-2xl p-6 text-center border border-purple-200">
            <p className="text-3xl font-black text-purple-600">11</p>
            <p className="text-sm text-purple-700 font-medium mt-1">Member States</p>
          </div>
          <div className="bg-indigo-50 rounded-2xl p-6 text-center border border-indigo-200">
            <p className="text-3xl font-black text-indigo-600">5+</p>
            <p className="text-sm text-indigo-700 font-medium mt-1">Years of Service</p>
          </div>
          <div className="bg-purple-50 rounded-2xl p-6 text-center border border-purple-200">
            <p className="text-3xl font-black text-purple-600">500+</p>
            <p className="text-sm text-purple-700 font-medium mt-1">Active Members</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
            <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center mb-4">
              <FiTarget className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Our Mission</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              To Promote, Grow and ensure Visibility of the Nigerian Eastern and Southern Event Industry, by Promoting Professionalism, Integrity, Confidence, Love and Brotherliness among all Event Vendors operating in all our Member States.
            </p>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mb-4">
              <FiEye className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Our Vision</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              To be the foremost professional body that unifies, empowers, and elevates event industry practitioners across the Southern and Eastern regions of Nigeria, setting the standard for excellence and integrity in the events profession.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
