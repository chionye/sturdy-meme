import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Logo from '../components/ui/Logo';
import { FiArrowLeft, FiBook } from 'react-icons/fi';

const articles = [
  {
    number: 1,
    title: 'PREAMBLE',
    content: `The name of this Professional body is THE EVENT ORGANIZERS AND PRACTITIONERS ASSOCIATION OF NIGERIA SOUTH/EAST (EOPANSE).\n\nAs the Event Management Industry grows and consolidates nationwide, it has given impetus to the need for an Association that plays the significant role of a Professional Support Structure for all Event Planners and Event Vendors in the Southern and Eastern parts of Nigeria, in order to ensure the continued growth and relevance of all Registered Members in its nest.\n\nThe body is made up of eleven (11) member states; Abia, Akwa-Ibom, Anambra, Bayelsa, Cross Rivers, Delta, Ebonyi, Edo, Enugu, Imo and Rivers States.`,
  },
  {
    number: 2,
    title: 'SUPREMACY OF THE CONSTITUTION',
    content: `This Constitution is binding on all registered Members of the EOPANSE. Where changes are made to the Constitution, then the Professional body shall take such steps as are required, to amend the affected areas wherein the executives discuss changes in the Leadership Board and once adopted in full, is considered final and relayed to the general house.`,
  },
  {
    number: 3,
    title: 'VISION',
    content: `To be the foremost professional body that unifies, empowers, and elevates event industry practitioners across the Southern and Eastern regions of Nigeria, setting the standard for excellence and integrity in the events profession.`,
  },
  {
    number: 4,
    title: 'MISSION',
    content: `Our mission is to Promote, Grow and ensure Visibility of the Nigerian Eastern and Southern Event Industry, by Promoting Professionalism, Integrity, Confidence, Love and Brotherliness among all Event Vendors operating in all our Member States.`,
  },
  {
    number: 5,
    title: 'VALUES',
    content: `The values which the Association shall strive to maintain are;\n\nIntegrity\nProfessionalism\nAccountability\nInnovation\nExcellence\nGrowth\nStewardship\nSustainability`,
  },
  {
    number: 6,
    title: 'AIMS AND OBJECTIVES',
    content: `The Aims and Objectives of this Organization shall be to act as the Professional Body for the Events Industry in the Southern and Eastern States of Nigeria, and to serve the interests of its Members through, but not exclusive to the following:\n\nCreate an Umbrella Platform for all EOPANSE Members, for the purpose of promoting their Businesses, Interests and Welfare.\n\nExpose Members to Funding and Support opportunities through Trainings and Publications.\n\nRegulate and Set Benchmark Standards for the Events Profession Operations and Service Delivery of Members to Clients.\n\nEnhance the Quality of Service and Members through Trainings and Information Exchange.\n\nSet Clear Ethical Guidelines and Codes of Professional Behavior and Standards\n\nInstitute Conflict Resolution Hearings for the purpose of Mediating and Resolving work related Disputes amongst Members.\n\nSet Sanctions and Institute Disciplinary Hearings in terms of Non-Compliance to Professional Standards set for the Events Industry by the Association.\n\nAct as a Support Structure that Caters to the Welfare of Members in Specified Areas.\n\nRecognize Excellence through Awards Programmes`,
  },
  {
    number: 7,
    title: 'CODE OF CONDUCT',
    content: `In order to maintain high standards in the Nigerian Event Industry as it relates to Eastern and Southern event vendors, provide reassurance to clients and potential clients and to ensure that Members businesses and the association maintain good reputation; members shall be bound by the following Code of Conduct:\n\nPromote and encourage the highest level of ethics within the events industry while maintaining the highest standards of professional conduct.\n\nStrive for excellence in all aspects of our profession by performing consistently at or above acceptable industry standards in execution and delivery of goods and services.\n\nUse only legal and ethical means in all industry negotiations, activities and resolution of disputes.\n\nProtect the public against fraud and unfair practices, and promote all practices which bring respect and credit to the profession.\n\nProvide truthful and accurate information with respect to the performance of duties. Use a written contract clearly stating all charges, services, products, performance, expectations and other essential information.\n\nHonor agreements with customers, clients, suppliers and services.\n\nMaintain industry accepted standards of safety and sanitation.\n\nCommit to increase professional growth and knowledge, to attend educational programs and to personally contribute expertise to meetings, online platforms and journals.\n\nStrive to cooperate with colleagues, suppliers, employees, employers and all persons supervised, in order to provide the highest quality service at every level.\n\nRespect client's confidentiality and honor nondisclosure agreement between vendor and clients.\n\nRespect the copyright or patent of colleagues and avoid passing off all, or any part of a colleague's job as theirs.\n\nRepresent all referrals and the lines of communication that come with them.`,
  },
];

const Constitution = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 pb-20 bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
            <FiBook className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Constitution</h1>
          <p className="text-purple-200 text-lg max-w-2xl mx-auto">
            The governing document of the Event Organizers and Practitioners Association of Nigeria South/East
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 pb-20">
        <Link to="/" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium mb-6 bg-white rounded-xl px-4 py-2 shadow-sm border border-purple-100 transition-colors">
          <FiArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="space-y-6">
          {articles.map((article) => (
            <div key={article.number} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-purple-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {article.number}
                  </span>
                  <h2 className="text-lg font-black text-gray-900">
                    ARTICLE {article.number}: {article.title}
                  </h2>
                </div>
              </div>
              <div className="px-6 py-5">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {article.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Constitution;
