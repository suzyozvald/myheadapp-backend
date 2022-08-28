import mongo from "mongodb";
//video br 22 FIPU WEB aplikacije
let connection_string =
  "mongodb+srv://suzyozvald:admin@cluster0.vli0z.mongodb.net/?retryWrites=true&w=majority";
let client = new mongo.MongoClient(connection_string, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db = null;
export default () => {
  return new Promise((resolve, reject) => {
    if (db && client.isConnected()) {
      resolve(db);
    } else {
      client.connect((err) => {
        if (err) {
          reject("Spajanje na bazu nije uspjelo:" + err);
        } else {
          console.log("Database connected successfully!");
          db = client.db("MyHeadAppDb");
          resolve(db);
        }
      });
    }
  });
};
