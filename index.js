import express from 'express';
import run from './run.js';
import bodyParser from 'body-parser';
import img from './img.js';
import pkg from 'pg';
const { Pool } = pkg;
import session from 'express-session';
import passport from 'passport';
import flash from 'connect-flash';
import bcrypt from 'bcrypt';
import LocalStrategy from 'passport-local';

const app = express();
const PORT = 3000;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'login',
    password: 'root',
    port: 5432,
  });

  app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
  }));

  app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));


passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const res = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      const user = res.rows[0];
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
  
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      const user = res.rows[0];
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

app.get('/', (req, res) => {
    if(req.isAuthenticated()){
    res.render('index');
    }else{
        res.redirect('/login');
    }

});

app.post("/", async (req, res) => {
    if(req.isAuthenticated()){
    try {
        const productDetails = JSON.parse(await run(`compare the prices of ${req.body.search} between different vendors in india in 
            this json format use the below template{
                itemName: "Sample Item",
                imageUrl: "url", 
                prices: [
                    { vendor: "Vendor A", logoUrl: "vendor url", price: "$10", rating: 4.5, availability: true, deliveryTime: "2-3 days",link:"venderwebsite(homepage)" },
                    { vendor: "Vendor B", logoUrl: "vendor url", price: "$12", rating: 4.0, availability: false, deliveryTime: "5-7 days" ,link:"venderwebsite(homepage)"},
                    { vendor: "Vendor C", logoUrl: "vendor url", price: "$9", rating: 4.7, availability: true, deliveryTime: "1-2 days" ,link:"venderwebsite(homepage)"}
                ]
            }
            note : i add correct image url link not temp url
            dont add comments in json file i should be able to convert it to object
            try adding real time data if not then add based on search but give me the data
            add 5 vendors if they are not availabe then add less 
            
            `));
            let name=productDetails.itemName.replace(/ /g, '+');
            console.log(name)
            let product=`https://www.google.co.in/search?q=${name}&sca_esv=fb5f53e1472aa45c&sca_upv=1&udm=2&biw=1536&bih=730&sxsrf=ADLYWIKQX9aLmv5STGBtf6te4L-oYMtEHA%3A1721979577749&ei=uVKjZuq6LYDe4-EPrb2W8AI&oq=amazon+&gs_lp=Egxnd3Mtd2l6LXNlcnAiB2FtYXpvbiAqAggAMg0QABiABBixAxhDGIoFMg0QABiABBixAxhDGIoFMggQABiABBixAzIIEAAYgAQYsQMyCBAAGIAEGLEDMggQABiABBixAzIIEAAYgAQYsQMyEBAAGIAEGLEDGEMYgwEYigUyBRAAGIAEMgoQABiABBhDGIoFSJ4LUC1YLXABeACQAQCYAYIBoAGCAaoBAzAuMbgBAcgBAPgBAZgCAqACiwHCAgsQABiABBixAxiDAZgDAIgGAZIHAzEuMaAHigU&sclient=gws-wiz-serp`;
            let img_url=await img(product)
            console.log(img_url)
            productDetails.imageUrl=img_url
        
        const imagePromises = productDetails.prices.map(async (priceDetail) => {
            let name = priceDetail.vendor.replace(/ /g, '+');
            const url = `https://www.google.co.in/search?q=${name}+logo&sca_esv=fb5f53e1472aa45c&sca_upv=1&udm=2&biw=1536&bih=730&sxsrf=ADLYWIKQX9aLmv5STGBtf6te4L-oYMtEHA%3A1721979577749&ei=uVKjZuq6LYDe4-EPrb2W8AI&oq=amazon+&gs_lp=Egxnd3Mtd2l6LXNlcnAiB2FtYXpvbiAqAggAMg0QABiABBixAxhDGIoFMg0QABiABBixAxhDGIoFMggQABiABBixAzIIEAAYgAQYsQMyCBAAGIAEGLEDMggQABiABBixAzIIEAAYgAQYsQMyEBAAGIAEGLEDGEMYgwEYigUyBRAAGIAEMgoQABiABBhDGIoFSJ4LUC1YLXABeACQAQCYAYIBoAGCAaoBAzAuMbgBAcgBAPgBAZgCAqACiwHCAgsQABiABBixAxiDAZgDAIgGAZIHAzEuMaAHigU&sclient=gws-wiz-serp`;
            priceDetail.logoUrl = await img(url);
            console.log(priceDetail.link)
        });

        await Promise.all(imagePromises);

        res.render("index", { itemName: productDetails.itemName, imageUrl: productDetails.imageUrl, prices: productDetails.prices });
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while processing your request.");
    }
}else{
    res.redirect('/login')
}
});


app.get('/login', (req, res) => {
    res.render('login', { message: req.flash('error') });
  });
  
  app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
  }));
  
  app.get('/register', (req, res) => {
    res.render('register', { message: req.flash('error') });
  });
  
  app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        'INSERT INTO users (username, password_hash, email) VALUES ($1, $2, $3)',
        [username, hashedPassword, email]
      );
      res.redirect('/login');
    } catch (err) {
      req.flash('error', 'Username or email already exists');
      res.redirect('/register');
    }
  });

app.listen(PORT, () => {
    console.log('Server is running on http://localhost:' + PORT);
});
