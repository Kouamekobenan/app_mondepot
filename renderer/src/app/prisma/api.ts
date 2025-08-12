// lib/api.ts
import axios from "axios";
import { OrderDto } from "../types/type";
const api = axios.create({
  // baseURL: "https://api-boisson-1.onrender.com",
  baseURL: "http://127.0.0.1:3001",
  // timeout: 10000, // facultatif
  headers: {
    "Content-Type": "application/json",
  },
});
export default api;


export const formatDate = (dateString: Date): string => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};


export function sendOrderViaWhatsApp(order: OrderDto, supplierPhone: string) {
  const whatsappUrl = `https://wa.me/${supplierPhone}?text=${order}`;
  window.open(whatsappUrl, "_blank");
}

