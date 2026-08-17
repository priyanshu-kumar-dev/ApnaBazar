import axios from "axios";

const API = axios.create({
  baseURL: "https://apnabazar-6zxf.onrender.com/api",
});

export default API;