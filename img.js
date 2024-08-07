import axios from "axios";
import cheerio from "cheerio"
async function getTenthImage(url) {
    try {
        // Fetch the HTML from the website
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Find all image tags
        const images = $('img');

        // Get the src attribute of the 10th image
        if (images.length >= 5) {
            const tenthImageUrl = $(images[4]).attr('src');
            return tenthImageUrl;
        } else {
            console.log('Not enough images found on the page.');
        }
    } catch (error) {
        console.error('Error fetching the page:', error);
    }
}

// Call the function with the desired URL
const url = 'https://www.google.co.in/search?q=amazon+prime&sca_esv=fb5f53e1472aa45c&sca_upv=1&udm=2&biw=1536&bih=730&sxsrf=ADLYWIKQX9aLmv5STGBtf6te4L-oYMtEHA%3A1721979577749&ei=uVKjZuq6LYDe4-EPrb2W8AI&oq=amazon+&gs_lp=Egxnd3Mtd2l6LXNlcnAiB2FtYXpvbiAqAggAMg0QABiABBixAxhDGIoFMg0QABiABBixAxhDGIoFMggQABiABBixAzIIEAAYgAQYsQMyCBAAGIAEGLEDMggQABiABBixAzIIEAAYgAQYsQMyEBAAGIAEGLEDGEMYgwEYigUyBRAAGIAEMgoQABiABBhDGIoFSJ4LUC1YLXABeACQAQCYAYIBoAGCAaoBAzAuMbgBAcgBAPgBAZgCAqACiwHCAgsQABiABBixAxiDAZgDAIgGAZIHAzEuMaAHigU&sclient=gws-wiz-serp'; // Replace with the URL you want to scrape
getTenthImage(url);

export default getTenthImage;
