"use client";

import { useEffect } from "react";

export default function PlerdyScript() {
  useEffect(() => {
    // Only run on client side to avoid hydration issues
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.defer = true;
    script.setAttribute("data-plerdy_code", "1");

    script.innerHTML = `
      var _protocol="https:"==document.location.protocol?"https://":"http://";
      _site_hash_code = "3d3fda62a753c0092226d9defbc3dd42",_suid=64201, plerdyScript=document.createElement("script");
      plerdyScript.setAttribute("defer",""),plerdyScript.dataset.plerdymainscript="plerdymainscript",
      plerdyScript.src="https://a.plerdy.com/public/js/click/main.js?v="+Math.random();
      var plerdymainscript=document.querySelector("[data-plerdymainscript='plerdymainscript']");
      plerdymainscript&&plerdymainscript.parentNode.removeChild(plerdymainscript);
      try{document.head.appendChild(plerdyScript)}catch(t){console.log(t,"unable add script tag")}
    `;

    document.head.appendChild(script);

    // Cleanup function
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null; // This component doesn't render anything
}
