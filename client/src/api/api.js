import axios from "axios";


const API = axios.create({

  baseURL: "https://apnabazar-6zxf.onrender.com",

  withCredentials: true,

});


export default API;