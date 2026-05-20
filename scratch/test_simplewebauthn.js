const { 
  generateRegistrationOptions, 
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} = require('@simplewebauthn/server');

console.log("generateRegistrationOptions:", typeof generateRegistrationOptions);
console.log("verifyRegistrationResponse:", typeof verifyRegistrationResponse);
console.log("generateAuthenticationOptions:", typeof generateAuthenticationOptions);
console.log("verifyAuthenticationResponse:", typeof verifyAuthenticationResponse);
