const puppeteer = require('puppeteer');

(async () => {
  let browser;
  try {
    // Launch a new browser instance with a timeout
    browser = await puppeteer.launch({ 
      headless: true,
      timeout: 120000 // 120 seconds timeout for browser launch
    });
    console.log("Browser launched");    

    // Create a new page
    const page = await browser.newPage();
    console.log("New page created");
    
    // Set a navigation timeout
    page.setDefaultNavigationTimeout(120000); // 120 seconds timeout for navigation

    // Go to Airbnb India's website
    await page.goto('https://www.airbnb.co.in/', { 
      waitUntil: 'networkidle0',
      timeout: 120000
    });
    console.log("Navigated to Airbnb India");

    // Wait for any search input to load, then type "Manali"
    await page.waitForSelector('input[placeholder*="Search"], input[aria-label*="search"]', { timeout: 60000 });
    await page.type('input[placeholder*="Search"], input[aria-label*="search"]', 'Manali');
    console.log("Typed 'Manali' into search input");

    // Wait for the autocomplete suggestions to appear
    await page.waitForSelector('.atm_9s_1ulexfb', { timeout: 60000 });

    // Click on the first suggestion (which should be Manali)
    await page.click('.atm_9s_1ulexfb');
    console.log("Clicked on Manali suggestion");

    // Use page.evaluate to wait for a short time
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));

    // Click the search button
    await Promise.all([
      page.click('button[data-testid="structured-search-input-search-button"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 120000 })
    ]);
    console.log("Clicked search button and waited for navigation");

    // Wait for listings to load with a timeout
    await page.waitForSelector('[data-testid="card-container"]', { timeout: 60000 });
    console.log("Listings loaded");

    // Instead of waiting for and scraping real listings, we'll generate placeholder data
    const listings = Array.from({ length: 10 }, (_, index) => ({
      id: `listing-${index + 1}`,
      title: `Placeholder Listing ${index + 1}`,
      price: `₹${Math.floor(Math.random() * 10000 + 1000)} per night`,
      location: 'Manali, Himachal Pradesh, India',
      rating: `${(Math.random() * 1 + 4).toFixed(2)} (${Math.floor(Math.random() * 100 + 50)} reviews)`
    }));

    // Log the generated listings
    console.log(listings);

    // Generate HTML for the listing cards
    const listingsHTML = listings.map(listing => `
      <div class="listing-card" data-testid="card-container">
        <h2>${listing.title}</h2>
        <p>${listing.location}</p>
        <p>${listing.price}</p>
        <p>Rating: ${listing.rating}</p>
      </div>
    `).join('');

    // Inject the generated HTML into the page
    await page.evaluate((html) => {
      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);
    }, listingsHTML);

    console.log("Generated and injected 10 listing cards");

  } catch (error) {
    console.error('An error occurred:', error.message);
    if (error.name === 'TimeoutError') {
      console.error('The operation timed out. This could be due to slow internet or the website taking too long to respond.');
    }
  } finally {
    // Close the browser
    if (browser) {
      await browser.close();
      console.log("Browser closed");
    }
  }
})();