# Demographics Feature Documentation

## Overview

The Demographics page is a new feature added to the Sabri Admin dashboard that visualizes customer locations based on order shipping addresses. This feature helps you understand where your customers are located geographically and identify market concentration areas.

## Features

### 1. **Interactive Map View**

- Displays customer locations on an interactive map using Leaflet
- Color-coded markers based on order volume:
  - 🔴 Red: 50+ orders
  - 🟠 Orange: 20-49 orders
  - 🟡 Yellow: 10-19 orders
  - 🟢 Green: <10 orders
- Multiple map views: Street, Satellite, and Terrain
- Click on markers to see detailed information about each location

### 2. **Statistics Dashboard**

Four key metric cards showing:

- Total Orders
- Unique Cities
- States Covered
- Top City Orders

### 3. **Advanced Filtering**

- Filter by State
- Filter by City
- Change map view type

### 4. **Top Cities List**

- Shows top 10 cities by order count
- Quick reference for market concentration

### 5. **State-wise Distribution Table**

- Complete breakdown of orders by state
- Shows number of cities per state
- Percentage distribution

## Technical Implementation

### Files Created

1. **`app/dashboard/demographics/page.js`**

   - Main demographics page component
   - Implements map visualization using react-leaflet
   - Handles filtering and data display

2. **`app/api/demographics/route.js`**
   - API endpoint to fetch and process demographics data
   - Aggregates order data by city and state
   - Includes coordinates mapping for Indian cities

### Dependencies Added

```json
{
  "leaflet": "^1.9.4",
  "react-leaflet": "^4.2.1"
}
```

### Navigation Integration

Added Demographics link to the sidebar in `app/dashboard/layout.js`:

- Icon: Map icon
- Color: Teal (hover effect)
- Route: `/dashboard/demographics`

## Data Processing

The demographics API processes order data as follows:

1. **Fetch Orders**: Retrieves all orders with shipping addresses from the database
2. **City Aggregation**: Groups orders by city and state
3. **Coordinate Mapping**: Maps cities to lat/lng coordinates for map display
4. **Statistics Generation**: Calculates totals, unique locations, and top cities

### City Coordinates

The API includes coordinates for 100+ major Indian cities. Cities are automatically mapped when they match the predefined list. To add more cities, update the `cityCoordinates` object in `app/api/demographics/route.js`.

## Usage

### Accessing the Page

1. Log in to Sabri Admin
2. Click "Demographics" in the sidebar
3. View the interactive map and statistics

### Using Filters

1. **Filter by State**: Select a state from the dropdown to view only orders from that state
2. **Filter by City**: Further narrow down to a specific city
3. **Change Map View**: Switch between Street, Satellite, and Terrain views

### Reading the Map

- **Marker Size**: Larger markers indicate more orders
- **Marker Color**: Color indicates order volume (see legend)
- **Click Markers**: Click any marker to see detailed location information
- **Zoom**: Use mouse wheel or map controls to zoom in/out
- **Pan**: Click and drag to move around the map

## API Endpoint

### GET `/api/demographics`

Returns demographics data based on order shipping addresses.

#### Response Format

```json
{
  "success": true,
  "totalOrders": 150,
  "uniqueLocations": 45,
  "cityStats": [
    {
      "city": "Mumbai",
      "state": "Maharashtra",
      "count": 25,
      "zipCodes": ["400001", "400002"],
      "coordinates": {
        "lat": 19.076,
        "lng": 72.8777
      }
    }
  ],
  "stateStats": [
    {
      "state": "Maharashtra",
      "count": 50,
      "cities": 10
    }
  ],
  "topCities": [
    {
      "city": "Mumbai",
      "state": "Maharashtra",
      "count": 25
    }
  ]
}
```

## Customization

### Adding New Cities

To add coordinates for additional cities, edit `app/api/demographics/route.js`:

```javascript
const cityCoordinates = {
  // Add new city
  YourCity: { lat: 12.3456, lng: 78.9012 },
  // ... existing cities
};
```

### Changing Map Style

You can modify the map appearance in `app/dashboard/demographics/page.js`:

```javascript
const getTileLayerUrl = () => {
  // Add new map style
  case "custom":
    return "https://your-tile-server/{z}/{x}/{y}.png";
  // ... existing styles
};
```

## Performance Considerations

1. **Data Caching**: The demographics data is fetched once on page load
2. **Lazy Loading**: Map components are dynamically imported to avoid SSR issues
3. **Database Indexing**: Order model has indexes on frequently queried fields

## Troubleshooting

### Map Not Displaying

1. Check if leaflet CSS is loaded
2. Verify that coordinates exist for your cities
3. Check browser console for errors

### No Data Showing

1. Ensure orders exist in the database
2. Verify shipping addresses have city and state fields
3. Check MongoDB connection

### Performance Issues

1. Consider adding pagination for large datasets
2. Implement data caching on the frontend
3. Add database indexes for shippingAddress fields

## Future Enhancements

Potential improvements for this feature:

1. **Heat Maps**: Add heat map overlay for better visualization
2. **Time Filters**: Filter by date range
3. **Export Data**: Export demographics data as CSV/Excel
4. **Customer Details**: Click through to see specific customers
5. **Revenue Mapping**: Show revenue instead of order count
6. **Clustering**: Group nearby markers for better performance
7. **Real-time Updates**: WebSocket integration for live updates
8. **Demographic Insights**: AI-powered insights and recommendations

## References

This feature was inspired by the FixMyCity Admin dashboard's LiveMap component, adapted for e-commerce order tracking with:

- Different data source (orders vs civic issues)
- E-commerce specific metrics
- City-based aggregation instead of individual markers
- State-level statistics

## Support

For issues or questions about this feature, please contact the development team or create an issue in the project repository.
