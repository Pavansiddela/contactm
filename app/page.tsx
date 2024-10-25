"use client";
import SwaggerUIComponent from "@/components/SwaggerUIComponent";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [spec, setSpec] = useState({});
  useEffect(() => {
    const fetchingdata = async () => {
      const res = await axios.get("api/v1/doc");
      console.log(res.data);
      setSpec(res.data);
    };
    fetchingdata();
  }, []);
  return <SwaggerUIComponent spec={spec} />;
}
