// src/components/SwaggerUIComponent.jsx
"use client"; // Ensure this is a client component

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUIComponent = ({ spec }: any) => {
  return <SwaggerUI spec={spec} />;
};

export default SwaggerUIComponent;
