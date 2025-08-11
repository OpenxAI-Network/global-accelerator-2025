import React, { useState, useRef, useEffect } from 'react';

interface OtpInputProps {
  length: number;
  onOtpSubmit: (otp: string) => void;
}

const OtpInput: React.FC<OtpInputProps> = ({ length, onOtpSubmit }) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    const otpString = newOtp.join('');
    if (otpString.length === length) onOtpSubmit(otpString);

    if (value && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <div className="flex justify-center items-center space-x-2">
      {otp.map((digit, index) => (
        <input
          key={index}
          type="text"
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          ref={(ref) => ref && (inputRefs.current[index] = ref)}
          className="w-12 h-12 text-center text-xl border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
          maxLength={1}
        />
      ))}
    </div>
  );
};

export default OtpInput;

