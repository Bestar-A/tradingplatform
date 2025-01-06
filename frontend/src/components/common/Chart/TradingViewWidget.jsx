import React, { useEffect, useRef, memo } from "react";

const TradingViewWidget = ({ symbol, id }) => {
  const container = useRef();
  const scriptRef = useRef(null);

  useEffect(() => {
    const widgetContainer = document.createElement("div");
    widgetContainer.id = `tradingview_${id}`;
    widgetContainer.style.height = "100%";
    widgetContainer.style.width = "100%";

    // Clear existing content
    if (container.current) {
      container.current.innerHTML = "";
      container.current.appendChild(widgetContainer);
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    const config = {
      autosize: true,
      symbol: symbol,
      interval: "60",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      enable_publishing: false,
      backgroundColor: "#16171a",
      gridColor: "rgba(240, 243, 250, 0.05)",
      allow_symbol_change: false,
      calendar: false,
      hide_side_toolbar: false,
      hide_legend: true,
      hide_volume: true,
      container_id: `tradingview_${id}`,
      studies: ["RSI@tv-basicstudies"],
    };

    script.innerHTML = JSON.stringify(config);
    scriptRef.current = script;

    if (widgetContainer) {
      widgetContainer.appendChild(script);
    }

    return () => {
      if (container.current) {
        container.current.innerHTML = "";
      }
    };
  }, [symbol, id]);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }} />
  );
};

export default memo(TradingViewWidget);
