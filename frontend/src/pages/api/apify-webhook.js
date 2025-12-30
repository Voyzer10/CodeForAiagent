export default async function handler(req, res) {
  if (req.method === "POST") {
    console.log("Apify data:", req.body);
    // process or save data here
    return res.status(200).json({ message: "Data received" });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
