import { motion } from 'framer-motion';

interface TermsAndConditionsProps {
  accepted: boolean;
  onAccept: () => void;
}

export const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ accepted, onAccept }) => {
  return (
    <div className="space-y-2">
      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          checked={accepted}
          onChange={onAccept}
          className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
        />
        <span className="text-sm text-gray-700">I accept the terms and conditions</span>
      </label>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        transition={{ duration: 0.3 }}
        className="bg-gray-100 p-4 rounded-md text-sm text-gray-700"
      >
        <h3 className="font-semibold mb-2">Terms and Conditions</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>All information provided is accurate and up-to-date.</li>
          <li>You consent to the storage and processing of your personal data.</li>
          <li>Medical records uploaded are genuine and unaltered.</li>
          <li>You agree to be contacted for verification purposes if needed.</li>
          <li>False information may result in termination of services.</li>
        </ul>
      </motion.div>
    </div>
  );
};

