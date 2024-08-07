import { GoogleGenerativeAI } from "@google/generative-ai"
import filter from "./filter.js"

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI("AIzaSyCyWeBfXO48iZmgGhapuKUgeZ_UP6n53TY");

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

async function run(prompt) {
  
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return (filter(text));
  }
  




  run(`compare the prices of iphone 15 between different vendors in india in 
    this json format use the below template{
        itemName: "Sample Item",
        imageUrl: "url", // URL to the product image
        prices: [
            { vendor: "Vendor A", logoUrl: "vendor url", price: "$10", rating: 4.5, availability: true, deliveryTime: "2-3 days" },
            { vendor: "Vendor B", logoUrl: "vendor url", price: "$12", rating: 4.0, availability: false, deliveryTime: "5-7 days" },
            { vendor: "Vendor C", logoUrl: "vendor url", price: "$9", rating: 4.7, availability: true, deliveryTime: "1-2 days" }
        ]
    }
    note : i add correct image url link not temp url
    dont add comments in json file
    `);


    export default run;