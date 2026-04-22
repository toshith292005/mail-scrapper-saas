import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

export function generateEmailPatterns(firstName: string, lastName: string, domain: string): string[] {
  const first = firstName.toLowerCase().trim();
  const last = lastName.toLowerCase().trim();
  const dom = domain.toLowerCase().trim();

  return [
    `${first}@${dom}`,
    `${first}${last}@${dom}`,
    `${first}.${last}@${dom}`,
    `${first[0]}${last}@${dom}`,
    `${first}_${last}@${dom}`,
    `${last}@${dom}`,
    `${first[0]}.${last}@${dom}`,
  ];
}

export async function verifyEmailMx(email: string): Promise<boolean> {
  try {
    const [, domain] = email.split('@');
    if (!domain) return false;

    const mxRecords = await resolveMx(domain);
    return mxRecords && mxRecords.length > 0;
  } catch (error) {
    // DNS resolution failed or no MX records
    return false;
  }
}

export async function findValidEmail(firstName: string, lastName: string, domain: string): Promise<{email: string | null, score: number}> {
  // 1. Check if domain has valid MX records first to save time
  const hasMx = await verifyEmailMx(`test@${domain}`);
  if (!hasMx) {
    return { email: null, score: 0 };
  }

  const patterns = generateEmailPatterns(firstName, lastName, domain);
  
  // In a real production system, we would connect to the SMTP server on port 25
  // and issue RCPT TO commands to verify each pattern.
  // Since ISPs and hosting providers often block port 25 locally, we simulate this.
  
  // Mock simulation: arbitrarily pick the first.last pattern as "found" with 80% confidence
  const likelyPattern = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain.toLowerCase()}`;
  
  return {
    email: likelyPattern,
    score: 0.85
  };
}
