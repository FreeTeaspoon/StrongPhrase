const fs = require('fs');

// Define the path to the US addresses JSON file
const US_ADDRESSES_FILE = 'src/data/us-addresses.min.json';
const TOP_CITIES_OUTPUT_FILE = 'src/data/us-addresses-filtered.min.json';

/**
 * Counts the number of addresses in the US addresses JSON file
 * and analyzes city distribution
 */
function countAddresses() {
  try {
    // Read the JSON file
    const data = fs.readFileSync(US_ADDRESSES_FILE, 'utf8');
    
    // Parse the JSON data
    const addressData = JSON.parse(data);
    
    // Check if the data has an addresses array
    if (addressData && addressData.addresses && Array.isArray(addressData.addresses)) {
      const count = addressData.addresses.length;
      console.log(`Total number of addresses: ${count}`);
      
      // Count cities with their states
      const cityCounts = {};
      const cityStateMap = {};
      
      addressData.addresses.forEach(address => {
        if (address.city && address.state) {
          const city = address.city.trim();
          const state = address.state.trim();
          const cityKey = `${city}, ${state}`;
          
          cityCounts[cityKey] = (cityCounts[cityKey] || 0) + 1;
          cityStateMap[cityKey] = { city, state };
        }
      });
      
      // Convert to array for sorting
      const cityCountsArray = Object.entries(cityCounts).map(([cityKey, count]) => ({
        cityKey,
        city: cityStateMap[cityKey].city,
        state: cityStateMap[cityKey].state,
        count
      }));
      
      // Sort by count in descending order
      cityCountsArray.sort((a, b) => b.count - a.count);
      
      // Display top 20 cities
      console.log('\nTop 20 cities by number of addresses:');
      const topCities = cityCountsArray.slice(0, 20);
      
      topCities.forEach((item, index) => {
        console.log(`${index + 1}. ${item.city}, ${item.state}: ${item.count} addresses`);
      });
      
      // Calculate total addresses in top cities
      const topCitiesTotal = topCities.reduce((sum, item) => sum + item.count, 0);
      const percentageOfTotal = ((topCitiesTotal / count) * 100).toFixed(2);
      
      console.log(`\nTotal addresses in top 20 cities: ${topCitiesTotal} (${percentageOfTotal}% of all addresses)`);
      
      // Create a set of top city-state pairs for quick lookup
      const topCitiesSet = new Set(topCities.map(item => `${item.city}, ${item.state}`));
      
      // Filter addresses to only include those in top cities
      const filteredAddresses = addressData.addresses.filter(address => {
        if (!address.city || !address.state) return false;
        
        // Skip Manchester, CT
        if (address.city.trim() === 'Manchester' && address.state.trim() === 'CT') return false;
        
        const cityStateKey = `${address.city.trim()}, ${address.state.trim()}`;
        return topCitiesSet.has(cityStateKey);
      }).map(address => {
        // Create a new address object with only the fields we want
        return {
          addr: address.address1,
          city: address.city,
          st: address.state,
          zip: address.postalCode
        };
      });
      
      // Create a new object with the same structure but only top city addresses
      const topCitiesData = { ...addressData };
      topCitiesData.addresses = filteredAddresses;
      
      // Save the filtered data to a new file
      fs.writeFileSync(
        TOP_CITIES_OUTPUT_FILE, 
        JSON.stringify(topCitiesData),
        'utf8'
      );
      
      console.log(`\nCreated file with addresses from top 20 cities: ${TOP_CITIES_OUTPUT_FILE}`);
      console.log(`File contains ${filteredAddresses.length} addresses`);
      
      return count;
    } else {
      console.error('The JSON file does not contain an addresses array');
      return 0;
    }
  } catch (error) {
    console.error('Error reading or parsing the addresses file:', error.message);
    return 0;
  }
}

// Run the function
countAddresses(); 