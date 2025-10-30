import { NextResponse } from "next/server";

export async function GET() {
  try {
    // CSV template for jewelry products
    const csvTemplate = `name,price,originalPrice,cost,category,subcategory,stock,brand,description,shortDescription,sku,material,metalType,gemstone,dimensions,careInstructions,warranty,isNewArrival,isBestSeller,isFeatured,isGiftable,isOnSale,ringCumBangles,men,women,kids,images
"Pearl Drop Necklace",3999,5999,2500,necklaces,"Pearl Necklaces",25,Sabri,"Elegant pearl drop necklace for special occasions. Handcrafted with premium materials and attention to detail.","Elegant pearl drop necklace",NECK001,Pearl,sterling-silver,Pearl,"45cm chain length","Store in a dry place, avoid contact with perfumes and lotions","1 year",false,true,true,true,true,false,false,true,false,"https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400&h=400&fit=crop|https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop"
"Diamond Stud Earrings",5999,7999,3500,earrings,"Stud Earrings",20,Sabri,"Classic diamond stud earrings for everyday elegance. Perfect for any occasion.","Classic diamond stud earrings",EARR001,Diamond,sterling-silver,Diamond,"6mm studs","Store in jewelry box, clean with soft brush","1 year",false,true,true,true,true,false,false,true,false,"https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400&h=400&fit=crop|https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop"
"18K Gold Wedding Ring",8999,12999,5500,rings,"Wedding Rings",15,Sabri,"Premium 18K gold wedding ring with classic design. Perfect for your special day.","Premium 18K gold wedding ring",RING001,"18K Gold",gold-plated,,"Available in sizes 6-12","Professional cleaning recommended","2 years",false,true,true,true,true,false,true,false,false,"https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop"
"925 Sterling Silver Ring",1899,2999,1200,fine-silver,"Silver Rings",35,Sabri,"Premium 925 sterling silver ring with elegant design. Hypoallergenic and tarnish-resistant.","Premium 925 sterling silver ring",FS001,"925 Sterling Silver",sterling-silver,,"Available in sizes 6-12","Clean with silver polish cloth","1 year",false,true,true,true,true,false,false,true,false,"https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop"
"Ring-cum-Bangles Set",6999,9999,4500,bracelets,"Ring-Bangles",30,Sabri,"Unique ring-cum-bangles set combining the elegance of rings with the beauty of bangles. Perfect for special occasions.","Unique ring-cum-bangles set",RCB001,Silver,sterling-silver,,"Adjustable sizes","Store in jewelry box","1 year",false,true,true,true,true,true,false,true,false,"https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop"`;

    return new NextResponse(csvTemplate, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition":
          "attachment; filename=jewelry_products_template.csv",
      },
    });
  } catch (error) {
    console.error("CSV template generation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate CSV template",
      },
      { status: 500 }
    );
  }
}
