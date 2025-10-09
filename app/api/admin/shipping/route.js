import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Mock shipping data - in a real app, this would come from a shipping service
    const shippingData = [
      {
        state: "Maharashtra",
        stateCode: "MH",
        gstCode: "27",
        cities: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
      },
      {
        state: "Delhi",
        stateCode: "DL",
        gstCode: "07",
        cities: ["New Delhi", "Central Delhi", "East Delhi"],
      },
      {
        state: "Karnataka",
        stateCode: "KA",
        gstCode: "29",
        cities: ["Bangalore", "Mysore", "Hubli", "Mangalore"],
      },
      {
        state: "Tamil Nadu",
        stateCode: "TN",
        gstCode: "33",
        cities: ["Chennai", "Coimbatore", "Madurai", "Salem"],
      },
      {
        state: "Gujarat",
        stateCode: "GJ",
        gstCode: "24",
        cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
      },
    ];

    return NextResponse.json({
      success: true,
      data: shippingData,
    });
  } catch (error) {
    console.error("Get shipping data error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error getting shipping data",
      },
      { status: 500 }
    );
  }
}
