// Initialize the map container, SVG, projection, and path
const mapContainer = d3.select('#map');
const containerWidth = mapContainer.node().getBoundingClientRect().width;
const containerHeight = mapContainer.node().getBoundingClientRect().height;

const svg = mapContainer.append('svg')
    .attr('width', containerWidth)
    .attr('height', containerHeight)
    .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

const projection = d3.geoMercator();
const path = d3.geoPath().projection(projection);

// Function to draw the base map
function drawMap() {
    return d3.json('boston.geojson').then(function(geojsonData) {
        projection.fitSize([containerWidth, containerHeight], geojsonData);
        svg.selectAll('path')
            .data(geojsonData.features)
            .enter().append('path')
            .attr('d', path)
            .attr('fill', 'lightgrey')
            .attr('stroke', 'black');
    }).catch(error => console.error("Error loading GeoJSON data:", error));
}

// Function to plot data points based on the number of reviews
function plotCategoryData(minReviews) {
    // Define the list of neighborhood names to include
    const validNeighborhoods = [
        "Allston", "Back Bay", "Bay Village", "Beacon Hill", "Brighton",
        "Charlestown", "Chinatown", "Dorchester", "Downtown", "East Boston",
        "Fenway", "Hyde Park", "Jamaica Plain", "Mattapan", "Mission Hill",
        "North End", "Roslindale", "Roxbury", "South Boston", "South End",
        "West End", "West Roxbury", "Wharf District"
    ];

    // Load the data and draw
    d3.csv('yelp_boston.csv').then(function(csvData) {
        // Remove existing data points
        svg.selectAll('.data-point').remove();

        // Filter the data based on valid neighborhoods and minimum number of reviews
        const filteredData = csvData.filter(d => 
            validNeighborhoods.some(neighborhood => d.neighborhood.toLowerCase().includes(neighborhood.toLowerCase())) &&
            +d.review_count > minReviews
        );

        // Define colors for each category
        const categoryColors = {
            "bakeries": "red",
            "cafes": "blue",
            "chinese": "green",
            "coffee": "brown",
            "french": "pink",
            "italian": "purple",
            "mexican": "orange",
            "pizza": "turquoise",
            // Add more categories and colors as needed
        };

        
        svg.selectAll('circle.data-point')
            .data(filteredData)
            .enter().append('circle')
            .attr('class', 'data-point') 
            .attr('cx', d => projection([+d.longitude, +d.latitude])[0])
            .attr('cy', d => projection([+d.longitude, +d.latitude])[1])
            .attr('r', 7)
            .attr('fill', d => categoryColors[d['search category']] || 'black') // Default to black if category not found
            .attr('opacity', 0.6);
    }).catch(error => {
        console.error("Error loading CSV dataset:", error);
    });
}


// Initial call to draw the map and plot data
drawMap().then(() => {
    plotCategoryData(0); // Start with default slider value or initial value
});

// Listen for changes to the slider
document.getElementById('reviews-slider').addEventListener('input', function() {
    const minReviews = +this.value;
    document.querySelector('label[for="reviews-slider"]').textContent = `Number of Reviews: ${minReviews}`;
    plotCategoryData(minReviews); // Update the visualization based on slider input
});

const categoryColors = {
    "bakeries": "red",
    "cafes": "blue",
    "chinese": "green",
    "coffee": "brown",
    "french": "pink",
    "italian": "purple",
    "mexican": "orange",
    "pizza": "turquoise",
    "other": "black"
    
};
function populateLegend() {
    const legend = document.getElementById('legend-items');
    Object.entries(categoryColors).forEach(([category, color]) => {
        let item = document.createElement('div');
        item.textContent = `${category}`;
        item.style.color = color; // Set text color to category color
        item.style.fontSize = '16px'; 
        item.style.fontWeight = 'bold'; 

        legend.appendChild(item);
    });
}



populateLegend();

