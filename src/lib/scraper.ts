import axios from 'axios';
import * as cheerio from 'cheerio';
import robotsParser from 'robots-parser';

export async function scrapeDomainForEmails(domain: string): Promise<string[]> {
  try {
    const url = domain.startsWith('http') ? domain : `https://${domain}`;
    const parsedUrl = new URL(url);
    const robotsUrl = `${parsedUrl.origin}/robots.txt`;

    // 1. Check robots.txt compliance
    let isAllowed = true;
    try {
      const robotsResponse = await axios.get(robotsUrl, { timeout: 5000 });
      const robots = robotsParser(robotsUrl, robotsResponse.data);
      isAllowed = robots.isAllowed(url, 'ApolloLite-Bot') ?? true;
    } catch (e) {
      // If robots.txt doesn't exist, assume allowed
    }

    if (!isAllowed) {
      console.warn(`Scraping disallowed by robots.txt for ${domain}`);
      return [];
    }

    // 2. Fetch page content
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'ApolloLite-Bot/1.0 (+http://apollolite.local)'
      },
      timeout: 10000
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // 3. Extract emails using Regex
    // Regex for basic email matching
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    
    // Extract from mailto links
    const emails = new Set<string>();
    
    $('a[href^="mailto:"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        const email = href.replace('mailto:', '').split('?')[0].trim();
        if (emailRegex.test(email)) emails.add(email);
      }
    });

    // Extract from text body
    const bodyText = $('body').text();
    const matches = bodyText.match(emailRegex);
    if (matches) {
      matches.forEach(match => emails.add(match.toLowerCase()));
    }

    return Array.from(emails);
  } catch (error) {
    console.error(`Error scraping domain ${domain}:`, error);
    return [];
  }
}
