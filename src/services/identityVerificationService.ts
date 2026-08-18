import { DEMO_OTP, INITIAL_DONOR_PROFILE } from '../data/donorData';

export interface DemoIdentityDetails {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  state: string;
  district: string;
  pinCode: string;
  maskedIdentity: string;
}

export async function requestIdentityOtp(aadhaarOrVid: string, mobile: string): Promise<{ demo: true }> {
  if (aadhaarOrVid.replace(/\D/g, '').length < 12 || mobile.replace(/\D/g, '').length !== 10) {
    throw new Error('Enter a valid demo Aadhaar/VID and 10-digit mobile number.');
  }
  return { demo: true };
}

export async function verifyDemoIdentity(otp: string): Promise<DemoIdentityDetails> {
  if (otp !== DEMO_OTP) throw new Error('Enter the demo OTP shown below.');
  return {
    fullName: INITIAL_DONOR_PROFILE.fullName,
    dateOfBirth: INITIAL_DONOR_PROFILE.dateOfBirth,
    gender: INITIAL_DONOR_PROFILE.gender,
    address: INITIAL_DONOR_PROFILE.address,
    state: INITIAL_DONOR_PROFILE.state,
    district: INITIAL_DONOR_PROFILE.district,
    pinCode: INITIAL_DONOR_PROFILE.pinCode,
    maskedIdentity: INITIAL_DONOR_PROFILE.maskedIdentity,
  };
}
